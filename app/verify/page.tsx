'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const certificate_no = searchParams.get('certificate_no');
    const tx_hash = searchParams.get('tx_hash');

    if (!certificate_no && !tx_hash) {
      setError('Lütfen bir sertifika numarası veya işlem hash\'i girin');
      setLoading(false);
      return;
    }

    fetch(`/api/certificates/verify?${certificate_no ? `certificate_no=${certificate_no}` : `tx_hash=${tx_hash}`}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setCertificate(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Doğrulama başarısız');
        setLoading(false);
      });
  }, [searchParams]);

  return (
    <main className="flex-1 py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-heading font-bold text-4xl text-ink mb-8 text-center">
            Sertifika Doğrulama
          </h1>

          {loading && (
            <div className="rounded-2xl shadow-sm p-12 text-center" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Doğrulanıyor...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 rounded-2xl p-8 text-center">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {certificate && (
            <div className="bg-white rounded-2xl shadow-sm p-8">
              {certificate.valid ? (
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="font-heading font-bold text-2xl text-green-600 mb-2">
                    Sertifika Geçerli
                  </h2>
                  <p className="text-gray-600">
                    Bu sertifika blockchain üzerinde doğrulanmıştır
                  </p>
                </div>
              ) : (
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="font-heading font-bold text-2xl text-red-600 mb-2">
                    Sertifika İptal Edildi
                  </h2>
                </div>
              )}

              <div className="space-y-4">
                <div className="bg-background rounded-xl p-4">
                  <h3 className="font-semibold text-ink mb-3">Sertifika Bilgileri</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Etkinlik:</span>
                      <span className="font-medium">{certificate.event?.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tarih:</span>
                      <span className="font-medium">
                        {new Date(certificate.event?.start_at).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sertifika No:</span>
                      <span className="font-mono text-xs">{certificate.certificate?.certificate_no}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-background rounded-xl p-4">
                  <h3 className="font-semibold text-ink mb-3">Blockchain Bilgileri</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chain:</span>
                      <span className="font-medium">{certificate.certificate?.chain}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Token ID:</span>
                      <span className="font-mono">{certificate.certificate?.token_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction Hash:</span>
                      <span className="font-mono text-xs truncate max-w-[200px]">
                        {certificate.certificate?.tx_hash}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IPFS CID:</span>
                      <span className="font-mono text-xs truncate max-w-[200px]">
                        {certificate.certificate?.ipfs_cid}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
  );
}
