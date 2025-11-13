"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, ScanBarcode, Loader2 } from "lucide-react"
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
  const [initializing, setInitializing] = useState(false)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (open) {
      startScanning()
    } else {
      stopScanning()
    }

    return () => {
      stopScanning()
    }
  }, [open])

  const startScanning = async () => {
    try {
      setError(null)
      setInitializing(true)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      if (!videoRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        setInitializing(false)
        return
      }

      streamRef.current = stream
      videoRef.current.srcObject = stream

      await new Promise<void>((resolve, reject) => {
        if (!videoRef.current) {
          reject(new Error("Video element not found"))
          return
        }

        const video = videoRef.current

        const onLoadedMetadata = () => {
          video
            .play()
            .then(() => resolve())
            .catch(reject)
        }

        if (video.readyState >= 2) {
          // Video is already loaded
          video
            .play()
            .then(() => resolve())
            .catch(reject)
        } else {
          video.addEventListener("loadedmetadata", onLoadedMetadata, { once: true })
        }

        // Timeout after 10 seconds
        setTimeout(() => reject(new Error("Video stream timeout")), 10000)
      })

      if (!readerRef.current) {
        readerRef.current = new BrowserMultiFormatReader()
      }

      setInitializing(false)
      setScanning(true)

      console.log("[v0] Starting barcode detection...")

      await readerRef.current.decodeFromVideoDevice(
        undefined, // Use default camera
        videoRef.current,
        (result, error) => {
          if (result) {
            console.log("[v0] Barcode detected:", result.getText())
            const barcode = result.getText()
            onScan(barcode)
            stopScanning()
            onOpenChange(false)
          }

          if (error && !(error instanceof NotFoundException)) {
            console.error("[v0] Barcode decode error:", error)
          }
        },
      )
    } catch (err: any) {
      console.error("[v0] Error starting scanner:", err)
      setInitializing(false)
      setScanning(false)

      if (err.name === "NotAllowedError") {
        setError("Permissão de câmera negada. Por favor, permita o acesso à câmera.")
      } else if (err.name === "NotFoundError") {
        setError("Nenhuma câmera encontrada no dispositivo.")
      } else if (err.message?.includes("timeout")) {
        setError("Tempo esgotado ao iniciar câmera. Tente novamente.")
      } else {
        setError(`Não foi possível acessar a câmera: ${err.message || "Erro desconhecido"}`)
      }
    }
  }

  const stopScanning = () => {
    console.log("[v0] Stopping scanner...")

    if (readerRef.current) {
      try {
        readerRef.current.reset()
      } catch (err) {
        console.error("[v0] Error resetting reader:", err)
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
        console.log("[v0] Stopped track:", track.label)
      })
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.pause()
    }

    setScanning(false)
    setInitializing(false)
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
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-32 border-2 border-primary rounded-md" />
              </div>
              {initializing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center text-white">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Iniciando câmera...</p>
                  </div>
                </div>
              )}
              {scanning && !initializing && (
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
