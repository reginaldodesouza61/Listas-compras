"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowPrompt(false)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setShowPrompt(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("installPromptDismissed", "true")
  }

  useEffect(() => {
    const dismissed = localStorage.getItem("installPromptDismissed")
    if (dismissed === "true") {
      setShowPrompt(false)
    }
  }, [])

  if (!showPrompt || !deferredPrompt) {
    return null
  }

  return (
    <Card className="relative">
      <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-6 w-6" onClick={handleDismiss}>
        <X className="h-4 w-4" />
      </Button>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          <CardTitle className="text-base">Instalar Aplicativo</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription>Instale o app na sua tela inicial para acesso rápido e funcionamento offline.</CardDescription>
        <Button onClick={handleInstall} className="w-full">
          Instalar Agora
        </Button>
      </CardContent>
    </Card>
  )
}
