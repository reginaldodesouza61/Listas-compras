"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ShoppingList } from "@/lib/firestore-hooks"
import { useState, useEffect } from "react"

interface EditListDialogProps {
  list: ShoppingList
  onEdit: (name: string, description: string) => Promise<void>
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditListDialog({ list, onEdit, open, onOpenChange }: EditListDialogProps) {
  const [name, setName] = useState(list.name)
  const [description, setDescription] = useState(list.description || "")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setName(list.name)
      setDescription(list.description || "")
    }
  }, [open, list.name, list.description])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      await onEdit(name.trim(), description.trim())
      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Error editing list:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
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
