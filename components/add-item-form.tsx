"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, ChevronDown, ChevronUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AddItemFormProps {
  onAddItem: (name: string, quantity: number | undefined, unitPrice: number | undefined, note: string) => Promise<void>
}

export function AddItemForm({ onAddItem }: AddItemFormProps) {
  const [name, setName] = useState("")
  const [quantity, setQuantity] = useState("")
  const [unitPrice, setUnitPrice] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      const parsedQuantity = quantity ? Number.parseFloat(quantity) : undefined
      const parsedUnitPrice = unitPrice ? Number.parseFloat(unitPrice) : undefined

      await onAddItem(name, parsedQuantity, parsedUnitPrice, note)
      setName("")
      setQuantity("")
      setUnitPrice("")
      setNote("")
      setShowDetails(false)
      toast({
        title: "Item adicionado!",
        description: `${name} foi adicionado à lista.`,
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o item.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Nome do produto..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={() => setShowDetails(!showDetails)} className="shrink-0 gap-1">
          {showDetails ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Menos
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />+ Detalhes
            </>
          )}
        </Button>
        <Button type="submit" disabled={loading || !name.trim()} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar
        </Button>
      </div>
      {showDetails && (
        <div className="grid grid-cols-3 gap-2">
          <Input
            type="number"
            placeholder="Quantidade"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="0"
            step="0.01"
          />
          <Input
            type="number"
            placeholder="Valor (R$)"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            min="0"
            step="0.01"
          />
          <Input placeholder="Observação" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      )}
    </form>
  )
}
