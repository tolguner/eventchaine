'use client';

import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        onScan(result.data);
      },
      {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    scannerRef.current = scanner;

    scanner.start().then(() => {
      setHasPermission(true);
    }).catch((err) => {
      console.error('QR Scanner error:', err);
      setHasPermission(false);
      onError?.('Kamera erişimi reddedildi');
    });

    return () => {
      scanner.stop();
      scanner.destroy();
    };
  }, [onScan, onError]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className="w-full max-w-md mx-auto rounded-xl"
        style={{ aspectRatio: '1/1', objectFit: 'cover' }}
      />
      
      {hasPermission === false && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-xl">
          <div className="text-center p-6">
            <p className="text-white mb-2">Kamera erişimi gerekli</p>
            <p className="text-sm text-gray-300">
              QR kod taramak için tarayıcınızın kamera iznini verin
            </p>
          </div>
        </div>
      )}

      {hasPermission === null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
          <div className="text-white">Kamera başlatılıyor...</div>
        </div>
      )}
    </div>
  );
}
