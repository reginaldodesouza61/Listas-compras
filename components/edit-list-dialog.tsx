"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pencil } from "lucide-react"
import type { ShoppingList } from "@/lib/firestore-hooks"

interface EditListDialogProps {
  list: ShoppingList
  onEdit: (name: string, description: string) => Promise<void>
}

export function EditListDialog({ list, onEdit }: EditListDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(list.name)
  const [description, setDescription] = useState(list.description || "")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      await onEdit(name.trim(), description.trim())
      setOpen(false)
    } catch (error) {
      console.error("[v0] Error editing list:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Reset form to current list values when opening
      setName(list.name)
      setDescription(list.description || "")
    }
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Pencil className="w-4 h-4 mr-2" />
          Editar Lista
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Lista</DialogTitle>
          <DialogDescription>Atualize as informações da lista de compras.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="listName">Nome da lista*</Label>
              <Input
                id="listName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Compras da Semana"
                required
              />
            </div>
            <div>
              <Label htmlFor="listDescription">Descrição (opcional)</Label>
              <Textarea
                id="listDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Itens para a semana"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
