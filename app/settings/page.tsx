"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Bell, BellOff, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { requestNotificationPermission, isPushNotificationsEnabled } from "@/lib/notifications"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [pushAvailable, setPushAvailable] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const checkNotifications = async () => {
      const available = await isPushNotificationsEnabled()
      setPushAvailable(available)

      if (typeof window !== "undefined" && "Notification" in window) {
        setNotificationsEnabled(Notification.permission === "granted")
      }
      setLoading(false)
    }
    checkNotifications()
  }, [])

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      toast({
        title: "Notificações desabilitadas",
        description: "Você pode reabilitar nas configurações do navegador.",
      })
      return
    }

    const token = await requestNotificationPermission()
    if (token) {
      setNotificationsEnabled(true)
      toast({
        title: "Notificações habilitadas!",
        description: "Você receberá atualizações das suas listas.",
      })
    } else {
      toast({
        title: "Permissão negada",
        description: "Não foi possível habilitar as notificações.",
        variant: "destructive",
      })
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-foreground">Configurações</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              Notificações Push
            </CardTitle>
            <CardDescription>
              Receba notificações quando houver atualizações nas suas listas compartilhadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pushAvailable ? (
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="flex-1 cursor-pointer">
                  {notificationsEnabled ? "Notificações ativadas" : "Ativar notificações"}
                </Label>
                <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={handleToggleNotifications} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Notificações push não estão configuradas. Consulte o guia de configuração do Firebase.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sobre o Aplicativo</CardTitle>
            <CardDescription>Informações sobre esta aplicação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-1">Versão</h3>
              <p className="text-sm text-muted-foreground">1.0.0</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-1">Recursos</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Listas compartilhadas em tempo real</li>
                <li>• Scanner de código de barras</li>
                <li>• Busca de produtos no Open Food Facts</li>
                <li>• Funciona offline</li>
                <li>• PWA instalável</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-1">Desenvolvedor</h3>
              <p className="text-sm text-muted-foreground">Desenvolvido por: Reginaldo de Souza</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conta</CardTitle>
            <CardDescription>Informações da sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-1">Email</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
