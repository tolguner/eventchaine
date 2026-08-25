'use client';

import { useState } from 'react';

interface BeaconCheckinProps {
  eventId: string;
  userId: string;
}

type Status = 'idle' | 'scanning' | 'success' | 'already' | 'error';

// Gerçek bir BLE beacon nonce'u cihazdan yayınlanır; bu proje Web Bluetooth
// API kullanmıyor, bu yüzden nonce'u burada üretiyoruz. Backend da yalnızca
// formatı doğruluyor (bkz. app/api/checkin/beacon/route.ts), belirli bir
// beacon donanımıyla eşleşme kontrolü yapmıyor. Bu nedenle bu buton bir
// demo/simülasyondur — QR check-in'in aksine gerçek bir yakınlık kanıtı
// sağlamaz.
function generateBeaconNonce() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let nonce = '';
  for (let i = 0; i < 8; i++) {
    nonce += chars[Math.floor(Math.random() * chars.length)];
  }
  return `BEACON-${nonce}`;
}

export default function BeaconCheckin({ eventId, userId }: BeaconCheckinProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const handleScan = async () => {
    setStatus('scanning');
    setMessage('');

    // Tarama animasyonu için kısa bir gecikme
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const res = await fetch('/api/checkin/beacon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beacon_nonce: generateBeaconNonce(),
          rssi: -45, // güçlü sinyal simülasyonu
          user_id: userId,
          event_id: eventId,
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setStatus('already');
        setMessage('Bu etkinliğe zaten check-in yaptınız.');
        return;
      }

      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Check-in başarısız oldu');
        return;
      }

      setStatus('success');
      setMessage(data.message || 'Check-in başarılı!');
    } catch {
      setStatus('error');
      setMessage('Sunucuya ulaşılamadı');
    }
  };

  if (status === 'success' || status === 'already') {
    return (
      <div
        className="w-full py-2 px-4 rounded-xl text-center text-sm"
        style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22C55E', color: '#22C55E' }}
      >
        ✅ {message}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleScan}
        disabled={status === 'scanning'}
        className="w-full py-2 rounded-xl transition disabled:opacity-60"
        style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}
        title="Yakındaki etkinlik beacon'ını simüle eder (demo)"
      >
        {status === 'scanning' ? '📡 Taranıyor...' : '📡 Beacon ile Check-in (Demo)'}
      </button>
      {status === 'error' && (
        <p className="text-xs mt-2 text-center" style={{ color: '#EF4444' }}>
          {message}
        </p>
      )}
    </div>
  );
}
