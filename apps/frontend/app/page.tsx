'use client';
import { useEffect, useState } from 'react';


// Helper to convert key for browser
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function HomePage() {
  const [message, setMessage] = useState("Loading...");

  // 1. Fetch the latest text from DB
  const fetchMessage = async () => {
    const res = await fetch(`https://shubhpwaapi.vercel.app/api/message`);
    const data = await res.json();
    setMessage(data.content);
  };

  // 2. Register SW and Subscribe to Push
  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      // Register Service Worker
      const register = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      // Wait for SW to be ready
      await navigator.serviceWorker.ready;

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
      
      if (!vapidKey) {
        console.error('NEXT_PUBLIC_VAPID_KEY is not set');
        return;
      }

      // Subscribe (Browser asks user for permission here)
      const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });

      // Send subscription to Backend
      await fetch(`https://shubhpwaapi.vercel.app/api/subscribe`, {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: { 'Content-Type': 'application/json' }
      });

      console.log("Push Subscribed!");
    } catch (err) {
      console.error("Push subscription failed:", err);
    }
  };

  useEffect(() => {
    fetchMessage();
    subscribeToPush();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">Latest Announcement</h1>

      <div className="p-6 border rounded shadow-lg bg-gray-50 max-w-md w-full text-center">
        <p className="text-xl text-blue-600 font-semibold">{message}</p>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        If you allowed notifications, you will receive updates even if this app is closed.
      </p>
    </div>
  );
}