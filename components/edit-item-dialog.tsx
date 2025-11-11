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
import type { ShoppingItem } from "@/lib/firestore-hooks"

interface EditItemDialogProps {
  item: ShoppingItem
  onEdit: (name: string, quantity: number | undefined, unitPrice: number | undefined, note: string) => Promise<void>
}

export function EditItemDialog({ item, onEdit }: EditItemDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(item.name)
  const [quantity, setQuantity] = useState(item.quantity?.toString() || "")
  const [unitPrice, setUnitPrice] = useState(item.unitPrice?.toString() || "")
  const [note, setNote] = useState(item.note || "")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      const quantityValue = quantity.trim() ? Number.parseFloat(quantity) : undefined
      const priceValue = unitPrice.trim() ? Number.parseFloat(unitPrice) : undefined

      await onEdit(name.trim(), quantityValue, priceValue, note.trim())
      setOpen(false)
    } catch (error) {
      console.error("[v0] Error editing item:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Reset form to current item values when opening
      setName(item.name)
      setQuantity(item.quantity?.toString() || "")
      setUnitPrice(item.unitPrice?.toString() || "")
      setNote(item.note || "")
    }
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Pencil className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Item</DialogTitle>
          <DialogDescription>Atualize as informações do item da lista.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do produto*</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Leite"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="any"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Ex: 2"
                />
              </div>
              <div>
                <Label htmlFor="unitPrice">Valor unitário (R$)</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="Ex: 5.50"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="note">Observação</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex: Desnatado"
                rows={2}
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
