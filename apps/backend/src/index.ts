import express from 'express';
import webpush from 'web-push';
import cors from 'cors';
import prisma from './db/prisma';
import { VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY } from './config';

const app = express();
const PORT = 3001;

const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://shubhpwa.vercel.app',
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());

webpush.setVapidDetails(
  'mailto:shubhashish147@gmail.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// --- ROUTES ---

// 1. GET: Fetch latest message for the main page
app.get('/api/message', async (req, res) => {
  const latest = await prisma.message.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  res.json(latest || { content: "No messages yet" });
});

// 2. POST: Users visit the site -> Browser sends subscription here
app.post('/api/subscribe', async (req, res) => {
  const subscription = req.body;
  
  try {
    // Upsert ensures we don't duplicate if the user refreshes
    await prisma.subscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: { keys: subscription.keys },
      create: {
        endpoint: subscription.endpoint,
        keys: subscription.keys
      }
    });
    res.status(201).json({});
  } catch (err) {
    console.error("Error saving subscription:", err);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// 3. POST: Admin submits text -> Saves to DB -> Sends Push
app.post('/api/broadcast', async (req, res) => {
  const { content } = req.body;

  try {
    // A. Save to Database
    await prisma.message.create({
      data: { content }
    });

    // B. Get all subscribers
    const subscriptions = await prisma.subscription.findMany();

    // C. Prepare Notification Payload
    const payload = JSON.stringify({
      title: "New Update!",
      body: content, // The text you typed
    });

    // D. Send to all (Parallel)
    const promises = subscriptions.map(sub => {
        // We must cast 'keys' because Prisma stores it as generic JSON
        const pushConfig = {
            endpoint: sub.endpoint,
            keys: sub.keys as { p256dh: string, auth: string }
        };

        return webpush.sendNotification(pushConfig, payload)
            .catch(err => {
                // Status 410 means the user is "Gone" (uninstalled/revoked permission)
                if (err.statusCode === 410) {
                    return prisma.subscription.delete({ where: { id: sub.id } });
                }
                console.error("Push error:", err);
            });
    });

    await Promise.all(promises);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Broadcast failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});