"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ShoppingList } from "@/lib/firestore-hooks"
import { MoreVertical, Users, Trash2, Pencil } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { EditListDialog } from "@/components/edit-list-dialog"
import { useState } from "react"

interface ListCardProps {
  list: ShoppingList
  onDelete: (listId: string) => void
  onClick: (listId: string) => void
  onEdit: (listId: string, name: string, description: string) => Promise<void>
}

export function ListCard({ list, onDelete, onClick, onEdit }: ListCardProps) {
  const { user } = useAuth()
  const isOwner = user?.uid === list.ownerId
  const memberCount = list.members.length
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const handleEdit = async (name: string, description: string) => {
    await onEdit(list.id, name, description)
  }

  return (
    <>
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onClick(list.id)}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{list.name}</CardTitle>
              {list.description && <CardDescription className="mt-1">{list.description}</CardDescription>}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditDialogOpen(true)
                    }}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar Lista
                  </DropdownMenuItem>
                )}
                {isOwner && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(list.id)
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Lista
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="w-4 h-4 mr-1" />
            <span>
              {memberCount} {memberCount === 1 ? "membro" : "membros"}
            </span>
          </div>
        </CardContent>
      </Card>

      <EditListDialog list={list} onEdit={handleEdit} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
    </>
  )
}
