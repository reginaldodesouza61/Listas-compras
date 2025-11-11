"use client"

import { useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/components/login-form"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import { useShoppingLists } from "@/lib/firestore-hooks"
import { CreateListDialog } from "@/components/create-list-dialog"
import { ListCard } from "@/components/list-card"
import { JoinListDialog } from "@/components/join-list-dialog"
import { InstallPrompt } from "@/components/install-prompt"
import { OfflineIndicator } from "@/components/offline-indicator"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const { user, loading: authLoading, logout } = useAuth()
  const { lists, loading: listsLoading, createList, deleteList, updateList, joinListByCode } = useShoppingLists()
  const router = useRouter()
  const { toast } = useToast()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  const handleDeleteList = async (listId: string) => {
    try {
      await deleteList(listId)
      toast({
        title: "Lista excluída",
        description: "A lista foi removida com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a lista.",
        variant: "destructive",
      })
    }
  }

  const handleEditList = async (listId: string, name: string, description: string) => {
    try {
      await updateList(listId, { name, description })
      toast({
        title: "Lista atualizada",
        description: "As alterações foram salvas com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a lista.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <OfflineIndicator />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-foreground">Minhas Listas</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          <InstallPrompt />

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Listas de Compras</h2>
              <p className="text-muted-foreground mt-1">Gerencie suas listas compartilhadas</p>
            </div>
            <div className="flex gap-2">
              <JoinListDialog onJoinList={joinListByCode} />
              <CreateListDialog onCreateList={createList} />
            </div>
          </div>

          {listsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : lists.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Você ainda não tem nenhuma lista de compras.</p>
              <div className="flex gap-2 justify-center">
                <JoinListDialog onJoinList={joinListByCode} />
                <CreateListDialog onCreateList={createList} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lists.map((list) => (
                <ListCard
                  key={list.id}
                  list={list}
                  onDelete={handleDeleteList}
                  onEdit={handleEditList}
                  onClick={(id) => router.push(`/list/${id}`)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
