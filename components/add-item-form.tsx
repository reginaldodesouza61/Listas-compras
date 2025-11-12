"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, ChevronDown, ChevronUp, ScanBarcode } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { searchProducts, getProductByBarcode, type OpenFoodFactsProduct } from "@/lib/open-food-facts"
import { BarcodeScanner } from "@/components/barcode-scanner"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface AddItemFormProps {
  onAddItem: (
    name: string,
    quantity: number | undefined,
    unitPrice: number | undefined,
    note: string,
    notifyMembers: boolean,
  ) => Promise<void>
  memberCount: number
}

export function AddItemForm({ onAddItem, memberCount }: AddItemFormProps) {
  const [name, setName] = useState("")
  const [quantity, setQuantity] = useState("")
  const [unitPrice, setUnitPrice] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<OpenFoodFactsProduct[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [notifyMembers, setNotifyMembers] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (name.length >= 2) {
        setSearchLoading(true)
        const results = await searchProducts(name)
        setSuggestions(results)
        setSearchLoading(false)
        if (results.length > 0) {
          setOpen(true)
        }
      } else {
        setSuggestions([])
        setOpen(false)
      }
    }, 400)

    return () => clearTimeout(timeoutId)
  }, [name])

  const handleSelectProduct = (product: OpenFoodFactsProduct) => {
    const productName = product.brands ? `${product.product_name} - ${product.brands}` : product.product_name

    setName(productName)

    if (product.quantity) {
      setNote(product.quantity)
      setShowDetails(true)
    }

    setOpen(false)
  }

  const handleBarcodeScan = async (barcode: string) => {
    setSearchLoading(true)
    toast({
      title: "Código escaneado!",
      description: `Buscando produto com código ${barcode}...`,
    })

    try {
      const product = await getProductByBarcode(barcode)

      if (product && product.product_name) {
        handleSelectProduct(product)
        toast({
          title: "Produto encontrado!",
          description: product.product_name,
        })
      } else {
        toast({
          title: "Produto não encontrado",
          description: "Não foi possível encontrar este produto no banco de dados.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível buscar o produto.",
        variant: "destructive",
      })
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      const parsedQuantity = quantity ? Number.parseFloat(quantity) : undefined
      const parsedUnitPrice = unitPrice ? Number.parseFloat(unitPrice) : undefined

      await onAddItem(name, parsedQuantity, parsedUnitPrice, note, notifyMembers)
      setName("")
      setQuantity("")
      setUnitPrice("")
      setNote("")
      setShowDetails(false)
      setNotifyMembers(false)
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
    <>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div className="flex-1 min-w-0">
                <Input
                  placeholder="Nome do produto..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                  autoFocus
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandList>
                  <CommandEmpty>
                    {name.length < 2
                      ? "Digite pelo menos 2 caracteres para buscar..."
                      : searchLoading
                        ? "Buscando produtos..."
                        : "Nenhum produto encontrado."}
                  </CommandEmpty>
                  {suggestions.length > 0 && (
                    <CommandGroup heading="Sugestões do Open Food Facts">
                      {suggestions.map((product) => (
                        <CommandItem
                          key={product.code}
                          value={product.product_name}
                          onSelect={() => handleSelectProduct(product)}
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col gap-0.5">
                            <div className="font-medium">{product.product_name}</div>
                            {product.brands && <div className="text-xs text-muted-foreground">{product.brands}</div>}
                            {product.quantity && (
                              <div className="text-xs text-muted-foreground">{product.quantity}</div>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowScanner(true)}
            className="shrink-0"
            title="Escanear código de barras"
          >
            <ScanBarcode className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
            className="flex-1 gap-1 text-xs sm:text-sm"
          >
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
          <Button type="submit" disabled={loading || !name.trim()} className="flex-1">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>
        {showDetails && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
            {memberCount > 1 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notify"
                  checked={notifyMembers}
                  onCheckedChange={(checked) => setNotifyMembers(!!checked)}
                />
                <Label htmlFor="notify" className="text-sm text-muted-foreground cursor-pointer">
                  Notificar participantes sobre este item
                </Label>
              </div>
            )}
          </div>
        )}
      </form>
      <BarcodeScanner open={showScanner} onOpenChange={setShowScanner} onScan={handleBarcodeScan} />
    </>
  )
}
