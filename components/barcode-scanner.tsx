"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, ScanBarcode } from "lucide-react"
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library"

interface BarcodeScannerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScan: (barcode: string) => void
}

export function BarcodeScanner({ open, onOpenChange, onScan }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)

  useEffect(() => {
    if (open && videoRef.current) {
      startScanning()
    }

    return () => {
      stopScanning()
    }
  }, [open])

  const startScanning = async () => {
    try {
      setError(null)
      setScanning(true)

      if (!readerRef.current) {
        readerRef.current = new BrowserMultiFormatReader()
      }

      const videoInputDevices = await readerRef.current.listVideoInputDevices()

      if (videoInputDevices.length === 0) {
        setError("Nenhuma câmera encontrada")
        setScanning(false)
        return
      }

      // Use the back camera if available (usually the last one on mobile)
      const selectedDeviceId = videoInputDevices[videoInputDevices.length - 1].deviceId

      await readerRef.current.decodeFromVideoDevice(selectedDeviceId, videoRef.current!, (result, error) => {
        if (result) {
          const barcode = result.getText()
          onScan(barcode)
          onOpenChange(false)
        }

        if (error && !(error instanceof NotFoundException)) {
          console.error("[v0] Barcode scan error:", error)
        }
      })
    } catch (err) {
      console.error("[v0] Error starting scanner:", err)
      setError("Não foi possível acessar a câmera. Verifique as permissões.")
      setScanning(false)
    }
  }

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset()
    }
    setScanning(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanBarcode className="w-5 h-5" />
            Escanear Código de Barras
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error ? (
            <div className="p-4 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>
          ) : (
            <div className="relative aspect-video bg-black rounded-md overflow-hidden">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-32 border-2 border-primary rounded-md" />
              </div>
              {scanning && (
                <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm bg-black/50 py-2">
                  Posicione o código de barras no centro
                </div>
              )}
            </div>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
