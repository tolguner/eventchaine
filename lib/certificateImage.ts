/**
 * NFT Sertifika Görsel Oluşturma
 * Canvas API kullanarak dinamik sertifika görseli üretir
 */

export interface CertificateData {
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  certificateNo: string;
  qrCodeUrl?: string;
}

/**
 * HTML Canvas kullanarak sertifika görseli oluşturur
 */
export async function generateCertificateImage(data: CertificateData): Promise<string> {
  // Browser ortamında çalışıyoruz
  if (typeof window === 'undefined') {
    throw new Error('Bu fonksiyon sadece tarayıcıda çalışır');
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 850;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Canvas context oluşturulamadı');

  // Arka plan gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Beyaz çerçeve
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(40, 40, canvas.width - 80, canvas.height - 80);

  // Dekoratif kenarlık
  ctx.strokeStyle = '#667eea';
  ctx.lineWidth = 8;
  ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

  // İç çerçeve
  ctx.strokeStyle = '#764ba2';
  ctx.lineWidth = 2;
  ctx.strokeRect(80, 80, canvas.width - 160, canvas.height - 160);

  // Başlık
  ctx.fillStyle = '#667eea';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('KATILIM SERTİFİKASI', canvas.width / 2, 160);

  // Alt başlık
  ctx.fillStyle = '#764ba2';
  ctx.font = '28px Arial';
  ctx.fillText('Certificate of Attendance', canvas.width / 2, 200);

  // Çizgi
  ctx.strokeStyle = '#667eea';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(300, 230);
  ctx.lineTo(900, 230);
  ctx.stroke();

  // "Bu sertifika verilir"
  ctx.fillStyle = '#333333';
  ctx.font = '24px Arial';
  ctx.fillText('Bu sertifika', canvas.width / 2, 290);

  // Kullanıcı adı (büyük ve bold)
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 42px Arial';
  ctx.fillText(data.userName, canvas.width / 2, 350);

  // Alt çizgi
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(350, 365);
  ctx.lineTo(850, 365);
  ctx.stroke();

  // "Etkinliğine katılım gösterdiği için"
  ctx.fillStyle = '#333333';
  ctx.font = '22px Arial';
  ctx.fillText('aşağıdaki etkinliğe katılım gösterdiği için verilmiştir', canvas.width / 2, 420);

  // Etkinlik başlığı
  ctx.fillStyle = '#667eea';
  ctx.font = 'bold 36px Arial';
  ctx.fillText(data.eventTitle, canvas.width / 2, 480);

  // Etkinlik detayları
  ctx.fillStyle = '#555555';
  ctx.font = '20px Arial';
  ctx.fillText(`📅 ${new Date(data.eventDate).toLocaleDateString('tr-TR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })}`, canvas.width / 2, 530);
  ctx.fillText(`📍 ${data.eventLocation}`, canvas.width / 2, 565);

  // Blockchain bilgisi
  ctx.fillStyle = '#999999';
  ctx.font = 'italic 16px Arial';
  ctx.fillText('🔗 Blockchain üzerinde doğrulanmış sertifika', canvas.width / 2, 620);

  // Sertifika numarası
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(`Sertifika No: ${data.certificateNo}`, canvas.width / 2, 680);

  // Alt bilgi
  ctx.fillStyle = '#999999';
  ctx.font = '14px Arial';
  ctx.fillText('EventChain Platform - Proof of Presence NFT', canvas.width / 2, 730);
  ctx.fillText('Bu sertifika değiştirilemez ve aktarılamaz (Soulbound Token)', canvas.width / 2, 755);

  // Logo veya dekoratif öğeler eklenebilir

  // Canvas'ı base64 image'e çevir
  return canvas.toDataURL('image/png');
}

/**
 * Sertifikayı PNG olarak indir
 */
export function downloadCertificate(imageDataUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = imageDataUrl;
  link.click();
}

/**
 * SVG tabanlı sertifika template (alternatif)
 */
export function generateCertificateSVG(data: CertificateData): string {
  return `
    <svg width="1200" height="850" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="850" fill="url(#grad)"/>
      
      <!-- White Frame -->
      <rect x="40" y="40" width="1120" height="770" fill="white"/>
      
      <!-- Border -->
      <rect x="60" y="60" width="1080" height="730" fill="none" stroke="#667eea" stroke-width="8"/>
      <rect x="80" y="80" width="1040" height="690" fill="none" stroke="#764ba2" stroke-width="2"/>
      
      <!-- Title -->
      <text x="600" y="160" font-family="Arial" font-size="48" font-weight="bold" fill="#667eea" text-anchor="middle">
        KATILIM SERTİFİKASI
      </text>
      
      <text x="600" y="200" font-family="Arial" font-size="28" fill="#764ba2" text-anchor="middle">
        Certificate of Attendance
      </text>
      
      <!-- Line -->
      <line x1="300" y1="230" x2="900" y2="230" stroke="#667eea" stroke-width="2"/>
      
      <!-- Content -->
      <text x="600" y="290" font-family="Arial" font-size="24" fill="#333" text-anchor="middle">
        Bu sertifika
      </text>
      
      <text x="600" y="350" font-family="Arial" font-size="42" font-weight="bold" fill="#000" text-anchor="middle">
        ${data.userName}
      </text>
      
      <line x1="350" y1="365" x2="850" y2="365" stroke="#ccc" stroke-width="1"/>
      
      <text x="600" y="420" font-family="Arial" font-size="22" fill="#333" text-anchor="middle">
        aşağıdaki etkinliğe katılım gösterdiği için verilmiştir
      </text>
      
      <text x="600" y="480" font-family="Arial" font-size="36" font-weight="bold" fill="#667eea" text-anchor="middle">
        ${data.eventTitle}
      </text>
      
      <text x="600" y="530" font-family="Arial" font-size="20" fill="#555" text-anchor="middle">
        📅 ${new Date(data.eventDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
      </text>
      
      <text x="600" y="565" font-family="Arial" font-size="20" fill="#555" text-anchor="middle">
        📍 ${data.eventLocation}
      </text>
      
      <text x="600" y="620" font-family="Arial" font-size="16" font-style="italic" fill="#999" text-anchor="middle">
        🔗 Blockchain üzerinde doğrulanmış sertifika
      </text>
      
      <text x="600" y="680" font-family="monospace" font-size="18" font-weight="bold" fill="#333" text-anchor="middle">
        Sertifika No: ${data.certificateNo}
      </text>
      
      <text x="600" y="730" font-family="Arial" font-size="14" fill="#999" text-anchor="middle">
        EventChain Platform - Proof of Presence NFT
      </text>
      
      <text x="600" y="755" font-family="Arial" font-size="14" fill="#999" text-anchor="middle">
        Bu sertifika değiştirilemez ve aktarılamaz (Soulbound Token)
      </text>
    </svg>
  `;
}
