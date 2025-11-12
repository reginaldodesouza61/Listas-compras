"use client"

import { useEffect, useRef } from "react"

export default function TesteCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        console.error("Erro ao acessar a câmera:", err)
      }
    }
    startCamera()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <h1 className="text-white text-lg mb-4">Teste de Câmera</h1>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-[480px] h-[360px] bg-black rounded-lg"
      />
    </div>
  )
}
