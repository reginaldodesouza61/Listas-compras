"use client"

import { getMessagingInstance } from "./firebase"
import { getToken, onMessage } from "firebase/messaging"
import { getVapidKey, isPushEnabled } from "@/app/actions/notifications"

export async function isPushNotificationsEnabled(): Promise<boolean> {
  return await isPushEnabled()
}

export async function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null
  }

  const pushEnabled = await isPushEnabled()
  if (!pushEnabled) {
    console.info("Push notifications not configured. Check Firebase setup guide.")
    return null
  }

  const permission = await Notification.requestPermission()

  if (permission !== "granted") {
    return null
  }

  try {
    const messaging = await getMessagingInstance()
    if (!messaging) return null

    const vapidKey = await getVapidKey()
    if (!vapidKey) return null

    const token = await getToken(messaging, {
      vapidKey,
    })

    return token
  } catch (error) {
    console.error("Error getting notification token:", error)
    return null
  }
}

export async function setupNotificationListener(callback: (payload: any) => void) {
  if (typeof window === "undefined") return

  const pushEnabled = await isPushEnabled()
  if (!pushEnabled) return

  const messaging = await getMessagingInstance()
  if (!messaging) return

  return onMessage(messaging, (payload) => {
    console.log("Message received:", payload)
    callback(payload)
  })
}

export function showLocalNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return
  }

  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/icon-light-32x32.png",
      badge: "/icon-light-32x32.png",
    })
  }
}
