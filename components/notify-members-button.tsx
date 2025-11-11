"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BellRing } from "lucide-react"
import { showLocalNotification } from "@/lib/notifications"
import { useToast } from "@/hooks/use-toast"

interface NotifyMembersButtonProps {
  listName: string
  memberCount: number
}

export function NotifyMembersButton({ listName, memberCount }: NotifyMembersButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleNotify = async () => {
    setLoading(true)
    try {
      // Simulate notification to members
      // In production, this would call a Cloud Function to send FCM notifications
      showLocalNotification("Lista Atualizada", `Há novidades na lista "${listName}"`)

      toast({
        title: "Participantes notificados!",
        description: `${memberCount} ${memberCount === 1 ? "membro foi notificado" : "membros foram notificados"}.`,
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar as notificações.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (memberCount <= 1) {
    return null
  }

  return (
    <Button variant="outline" size="sm" onClick={handleNotify} disabled={loading}>
      <BellRing className="w-4 h-4 mr-2" />
      Notificar Participantes
    </Button>
  )
}
