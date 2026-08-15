'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: {
    ticket_code: string;
    qr_payload: string;
    event: {
      title: string;
      start_at: string;
      location: string;
    };
  };
}

export default function QRModal({ isOpen, onClose, ticket }: QRModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && canvasRef.current && ticket.qr_payload) {
      QRCode.toCanvas(canvasRef.current, ticket.qr_payload, {
        width: 300,
        margin: 2,
      });
    }
  }, [isOpen, ticket.qr_payload]);

  if (!isOpen) return null;

  const date = new Date(ticket.event.start_at);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="rounded-2xl max-w-md w-full p-6 relative" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 transition"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="font-heading font-bold text-2xl text-ink mb-4">
          Etkinlik Bileti
        </h2>

        <div className="bg-background rounded-xl p-4 mb-4">
          <h3 className="font-semibold text-lg mb-2">{ticket.event.title}</h3>
          <p className="text-sm text-gray-600 mb-1">
            📅 {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            📍 {ticket.event.location}
          </p>
          <p className="text-xs text-gray-500 font-mono">
            {ticket.ticket_code}
          </p>
        </div>

        <div className="flex justify-center mb-4">
          <canvas ref={canvasRef} className="border-4 border-primary rounded-xl"></canvas>
        </div>

        <p className="text-sm text-gray-600 text-center">
          Etkinlik girişinde bu QR kodu organizatöre gösterin
        </p>
      </div>
    </div>
  );
}
