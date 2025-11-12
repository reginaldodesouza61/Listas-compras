"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, ScanBarcode } from "lucide-react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ open, onOpenChange, onScan }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (open) {
      startScanning();
    } else {
      stopScanning();
    }
    return () => stopScanning();
  }, [open]);

  const startScanning = async () => {
    try {
      setError(null);
      setScanning(true);

      // Solicita permissão explicitamente
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      if (!readerRef.current) {
        readerRef.current = new BrowserMultiFormatReader();
      }

      const videoInputDevices = await readerRef.current.listVideoInputDevices();
      const backCamera = videoInputDevices.find((d) =>
        d.label.toLowerCase().includes("back") || d.label.toLowerCase().includes("traseira")
      );
      const selectedDeviceId = backCamera?.deviceId || videoInputDevices[0]?.deviceId;

      if (!selectedDeviceId) {
        setError("Nenhuma câmera encontrada.");
        setScanning(false);
        return;
      }

      readerRef.current.decodeFromVideoDevice(selectedDeviceId, videoRef.current!, (result, err) => {
        if (result) {
          const code = result.getText();
          onScan(code);
          onOpenChange(false);
        }
        if (err && !(err instanceof NotFoundException)) {
          console.warn("Erro ao ler código:", err);
        }
      });
    } catch (err) {
      console.error("Erro ao iniciar câmera:", err);
      setError("Não foi possível acessar a câmera. Verifique as permissões.");
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset();
    }
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((t) => t.stop());
    }
    setScanning(false);
  };

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
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
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
  );
}
