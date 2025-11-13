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
import { Share2, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ShareListDialogProps {
  listId: string
  shareCode: string
  onShareByEmail: (email: string) => Promise<void>
}

export function ShareListDialog({ listId, shareCode, onShareByEmail }: ShareListDialogProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopyCode = () => {
    navigator.clipboard.writeText(shareCode)
    setCopied(true)
    toast({
      title: "Código copiado!",
      description: "O código foi copiado para a área de transferência.",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareByEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onShareByEmail(email)
      toast({
        title: "Convite enviado!",
        description: `Convite enviado para ${email}.`,
      })
      setEmail("")
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar o convite.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Share2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Compartilhar Lista</DialogTitle>
          <DialogDescription>Convide outras pessoas para colaborar nesta lista.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="code" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="code">Por Código</TabsTrigger>
            <TabsTrigger value="email">Por Email</TabsTrigger>
          </TabsList>
          <TabsContent value="code" className="space-y-4">
            <div className="space-y-2">
              <Label>Código de Compartilhamento</Label>
              <div className="flex gap-2">
                <Input value={shareCode} readOnly className="font-mono text-lg tracking-wider" />
                <Button type="button" variant="outline" onClick={handleCopyCode} className="shrink-0 bg-transparent">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Compartilhe este código com outras pessoas para que elas possam entrar na lista.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="email" className="space-y-4">
            <form onSubmit={handleShareByEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email do Usuário</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  O usuário precisa já ter criado uma conta no app com este email para poder receber o convite.
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar Convite"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
