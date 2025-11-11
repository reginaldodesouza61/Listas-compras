"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bell, BellOff } from "lucide-react"
import { requestNotificationPermission, isPushNotificationsEnabled } from "@/lib/notifications"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function NotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [loading, setLoading] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission)
    }

    isPushNotificationsEnabled().then(setPushEnabled)
  }, [])

  const handleRequestPermission = async () => {
    setLoading(true)
    try {
      const token = await requestNotificationPermission()

      if (token) {
        setPermission("granted")
        toast({
          title: "Notificações ativadas!",
          description: "Você receberá atualizações quando houver mudanças nas listas.",
        })
      } else {
        toast({
          title: "Não foi possível ativar",
          description: "Verifique as configurações ou permissões do navegador.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao solicitar permissão.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (typeof window === "undefined" || !("Notification" in window) || !pushEnabled) {
    return null
  }

  if (permission === "granted") {
    return (
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Notificações Ativas</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Você receberá notificações quando membros da lista adicionarem ou marcarem itens.
          </CardDescription>
        </CardContent>
      </Card>
    )
  }

  if (permission === "denied") {
    return (
      <Card className="bg-muted">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BellOff className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-base">Notificações Bloqueadas</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription>
            As notificações foram bloqueadas. Ative nas configurações do navegador para receber atualizações.
          </CardDescription>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <CardTitle className="text-base">Ativar Notificações</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription>
          Receba notificações em tempo real quando membros da lista adicionarem ou marcarem itens.
        </CardDescription>
        <Button onClick={handleRequestPermission} disabled={loading} className="w-full">
          {loading ? "Solicitando..." : "Ativar Notificações"}
        </Button>
      </CardContent>
    </Card>
  )
}
