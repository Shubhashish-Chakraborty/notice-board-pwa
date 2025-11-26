import { config } from "dotenv";
config();

export const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY as string;
export const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY as string;