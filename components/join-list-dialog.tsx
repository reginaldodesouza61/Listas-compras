"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface JoinListDialogProps {
  onJoinList: (code: string) => Promise<string>
}

export function JoinListDialog({ onJoinList }: JoinListDialogProps) {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const listId = await onJoinList(code)
      toast({
        title: "Você entrou na lista!",
        description: "Redirecionando...",
      })
      setCode("")
      setOpen(false)
      router.push(`/list/${listId}`)
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível entrar na lista.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="w-4 h-4 mr-2" />
          Entrar em Lista
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Entrar em Lista Compartilhada</DialogTitle>
          <DialogDescription>Digite o código de compartilhamento para acessar uma lista.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Código de Compartilhamento</Label>
            <Input
              id="code"
              placeholder="EX: ABC123"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="font-mono text-lg tracking-wider uppercase"
              maxLength={6}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
            {loading ? "Entrando..." : "Entrar na Lista"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
