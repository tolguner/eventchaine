import { useState } from 'react';
import Badge from './Badge';
import { generateCertificateImage, downloadCertificate } from '@/lib/certificateImage';

interface CertificateCardProps {
  certificate: {
    id: string;
    certificate_no: string;
    ipfs_cid: string;
    chain: string;
    token_id: string;
    tx_hash: string;
    minted_at: string;
    revoked_at: string | null;
    event: {
      title: string;
      start_at: string;
      location?: string;
    };
  };
  onVerify: () => void;
  userName?: string;
}

export default function CertificateCard({ certificate, onVerify, userName }: CertificateCardProps) {
  const date = new Date(certificate.event.start_at);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadCertificate = async () => {
    setIsGenerating(true);
    try {
      const imageUrl = await generateCertificateImage({
        userName: userName || 'Katılımcı',
        eventTitle: certificate.event.title,
        eventDate: certificate.event.start_at,
        eventLocation: certificate.event.location || 'Online',
        certificateNo: certificate.certificate_no,
      });

      downloadCertificate(
        imageUrl,
        `sertifika-${certificate.certificate_no}.png`
      );
    } catch (error) {
      console.error('Certificate generation error:', error);
      alert('Sertifika oluşturulurken bir hata oluştu');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-2xl shadow-sm p-6 border-2 border-primary/20" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-heading font-semibold text-xl mb-1" style={{ color: 'var(--text-primary)' }}>
            {certificate.event.title}
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {certificate.revoked_at ? (
          <Badge variant="warning">İptal Edildi</Badge>
        ) : (
          <Badge variant="success">Aktif</Badge>
        )}
      </div>

      <div className="rounded-xl p-4 space-y-2 mb-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>Sertifika No:</span>
          <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{certificate.certificate_no}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>Token ID:</span>
          <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{certificate.token_id}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>Blockchain:</span>
          <span style={{ color: 'var(--text-primary)' }}>{certificate.chain}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>IPFS CID:</span>
          <span className="font-mono text-xs truncate max-w-[200px]" style={{ color: 'var(--text-primary)' }}>{certificate.ipfs_cid}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleDownloadCertificate}
          disabled={isGenerating}
          className="flex-1 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:opacity-90 transition disabled:opacity-50 font-medium"
        >
          {isGenerating ? '⏳ Oluşturuluyor...' : '🎨 NFT İndir'}
        </button>
        <button
          onClick={onVerify}
          className="flex-1 py-2 bg-primary text-white rounded-xl hover:opacity-90 transition font-medium"
        >
          🔗 Doğrula
        </button>
      </div>
    </div>
  );
}
