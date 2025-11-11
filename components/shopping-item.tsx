"use client"

import type { ShoppingItem } from "@/lib/firestore-hooks"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreVertical, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { EditItemDialog } from "@/components/edit-item-dialog"

interface ShoppingItemProps {
  item: ShoppingItem
  onToggle: (itemId: string, completed: boolean) => void
  onDelete: (itemId: string) => void
  onEdit: (
    itemId: string,
    name: string,
    quantity: number | undefined,
    unitPrice: number | undefined,
    note: string,
  ) => Promise<void>
}

export function ShoppingItemComponent({ item, onToggle, onDelete, onEdit }: ShoppingItemProps) {
  const [showDetails, setShowDetails] = useState(false)

  const itemTotal = item.quantity && item.unitPrice ? (item.quantity * item.unitPrice).toFixed(2) : null

  const hasDetails = item.quantity || item.unitPrice || item.note

  const handleEdit = async (
    name: string,
    quantity: number | undefined,
    unitPrice: number | undefined,
    note: string,
  ) => {
    await onEdit(item.id, name, quantity, unitPrice, note)
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 bg-card rounded-lg border border-border hover:bg-accent/50 transition-colors",
        item.completed && "opacity-60",
      )}
    >
      <Checkbox
        checked={item.completed}
        onCheckedChange={(checked) => onToggle(item.id, checked as boolean)}
        className="shrink-0 mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("font-medium text-foreground", item.completed && "line-through text-muted-foreground")}>
            {item.name}
          </span>
          {itemTotal && <span className="text-sm font-semibold text-primary">R$ {itemTotal}</span>}
        </div>
        {hasDetails && (
          <>
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  Ocultar detalhes
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  Ver detalhes
                </>
              )}
            </button>
            {showDetails && (
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                {item.quantity && (
                  <p>
                    <span className="font-medium">Quantidade:</span> {item.quantity}
                  </p>
                )}
                {item.unitPrice && (
                  <p>
                    <span className="font-medium">Valor unitário:</span> R$ {item.unitPrice.toFixed(2)}
                  </p>
                )}
                {item.note && (
                  <p>
                    <span className="font-medium">Observação:</span> {item.note}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <EditItemDialog item={item} onEdit={handleEdit} />
          <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
