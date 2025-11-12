"use client";

import { useRef, useEffect } from "react";

export default function TesteCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Erro ao acessar câmera:", err);
        alert("Não foi possível acessar a câmera. Verifique as permissões.");
      }
    }

    initCamera();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Teste da Câmera</h2>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: "100%",
          maxWidth: 500,
          borderRadius: 10,
          background: "#000",
        }}
      />
    </div>
  );
}
