"use client"

import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useShoppingLists, useShoppingItems } from "@/lib/firestore-hooks"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Users, Search } from "lucide-react"
import { AddItemForm } from "@/components/add-item-form"
import { ShoppingItemComponent } from "@/components/shopping-item"
import { ShareListDialog } from "@/components/share-list-dialog"
import { ManageMembersDialog } from "@/components/manage-members-dialog"
import { OfflineIndicator } from "@/components/offline-indicator"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"

export default function ListPage() {
  const params = useParams()
  const router = useRouter()
  const listId = params.id as string
  const { user, loading: authLoading } = useAuth()
  const { lists, loading: listsLoading, shareList, removeMember } = useShoppingLists()
  const { items, loading: itemsLoading, addItem, toggleItem, deleteItem, updateItem } = useShoppingItems(listId)
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")

  const list = lists.find((l) => l.id === listId)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  if (authLoading || listsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!list) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Lista não encontrada</p>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  const handleAddItem = async (
    name: string,
    quantity: number | undefined,
    unitPrice: number | undefined,
    note: string,
  ) => {
    if (!user) return
    await addItem(listId, name, quantity, unitPrice, note, user.uid)
  }

  const handleToggleItem = async (itemId: string, completed: boolean) => {
    await toggleItem(itemId, completed, listId)
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem(itemId, listId)
      toast({
        title: "Item removido",
        description: "O item foi excluído da lista.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o item.",
        variant: "destructive",
      })
    }
  }

  const handleEditItem = async (
    itemId: string,
    name: string,
    quantity: number | undefined,
    unitPrice: number | undefined,
    note: string,
  ) => {
    try {
      const itemData: any = { name, note }

      if (quantity !== undefined && quantity > 0) {
        itemData.quantity = quantity
      } else {
        itemData.quantity = null
      }

      if (unitPrice !== undefined && unitPrice > 0) {
        itemData.unitPrice = unitPrice
      } else {
        itemData.unitPrice = null
      }

      await updateItem(itemId, listId, itemData)
      toast({
        title: "Item atualizado",
        description: "As alterações foram salvas com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o item.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveMember = async (userId: string) => {
    await removeMember(listId, userId)
  }

  const filteredItems = items.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const completedCount = filteredItems.filter((item) => item.completed).length
  const totalCount = filteredItems.length

  const listTotal = items.reduce((sum, item) => {
    if (item.quantity && item.unitPrice) {
      return sum + item.quantity * item.unitPrice
    }
    return sum
  }, 0)

  return (
    <>
      <OfflineIndicator />
      <div className="min-h-screen bg-background pb-24">
        <header className="border-b border-border bg-card sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
              <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="shrink-0 mt-1">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">{list.name}</h1>
                {list.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{list.description}</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <ManageMembersDialog
                  listId={listId}
                  memberIds={list.members}
                  ownerId={list.ownerId}
                  currentUserId={user?.uid || ""}
                  onRemoveMember={handleRemoveMember}
                />
                <ShareListDialog
                  listId={listId}
                  shareCode={(list as any).shareCode || "LOADING"}
                  onShareByEmail={(email) => shareList(listId, email)}
                />
              </div>
            </div>
            {totalCount > 0 && (
              <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {list.members.length} {list.members.length === 1 ? "membro" : "membros"}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  {completedCount} de {totalCount} {totalCount === 1 ? "item" : "itens"}
                </span>
              </div>
            )}
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
          <div>
            <AddItemForm
              onAddItem={handleAddItem}
              existingItems={items.map((item) => ({ name: item.name, completed: item.completed }))}
            />
          </div>

          {items.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar itens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          {itemsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Nenhum item encontrado com esse termo."
                  : "Nenhum item na lista ainda. Adicione o primeiro!"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <ShoppingItemComponent
                  key={item.id}
                  item={item}
                  onToggle={handleToggleItem}
                  onDelete={handleDeleteItem}
                  onEdit={handleEditItem}
                />
              ))}
            </div>
          )}
        </main>

        {listTotal > 0 && (
          <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
            <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <span className="text-base sm:text-lg font-semibold text-foreground">Total da lista:</span>
                <span className="text-xl sm:text-2xl font-bold text-primary">R$ {listTotal.toFixed(2)}</span>
              </div>
            </div>
          </footer>
        )}
      </div>
    </>
  )
}
