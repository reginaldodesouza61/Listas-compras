"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  if (authLoading) {
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
