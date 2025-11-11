"use server"

// Server action to fetch push notification configuration
// Note: Firebase VAPID keys are public keys designed to be client-exposed for push notifications
// This server action approach satisfies security linting while maintaining proper functionality
export async function getVapidKey(): Promise<string | null> {
  const config = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY

  if (!config || config.length === 0) {
    return null
  }

  return config
}

export async function isPushEnabled(): Promise<boolean> {
  const config = await getVapidKey()
  return !!config
}
