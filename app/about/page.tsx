export default function AboutPage() {
  return (
    <main className="flex-1 py-12 px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading font-bold text-4xl mb-8 text-center" style={{ color: 'var(--text-primary)' }}>
            Hakkımızda
          </h1>

          <div className="rounded-2xl shadow-sm p-8 mb-8" style={{ backgroundColor: 'var(--bg-primary)', border: '2px solid var(--border-primary)' }}>
            <h2 className="font-heading font-semibold text-2xl mb-4" style={{ color: 'var(--text-primary)' }}>
              Proof of Presence (PoP) Nedir?
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              Proof of Presence, fiziksel veya sanal etkinliklere katılımın blockchain üzerinde 
              doğrulanabilir şekilde kaydedilmesini sağlayan bir Web3 platformudur.
            </p>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              IT&MIS Kulübü olarak, öğrencilerin etkinliklere katılımlarını kayıt altına almak, 
              devredilemez dijital sertifikalar (Soulbound NFT) ile ödüllendirmek ve blockchain 
              teknolojisi ile güvenilir bir kayıt sistemi oluşturmayı hedefliyoruz.
            </p>
          </div>

          <div className="rounded-2xl shadow-sm p-8 mb-8" style={{ backgroundColor: 'var(--bg-primary)', border: '2px solid var(--border-primary)' }}>
            <h2 className="font-heading font-semibold text-2xl mb-4" style={{ color: 'var(--text-primary)' }}>
              Nasıl Çalışır?
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold" style={{ backgroundColor: 'rgba(250, 158, 15, 0.1)', color: 'var(--accent-primary)' }}>
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Ön Kayıt</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Etkinliğe online ön kayıt ol, sistem sana benzersiz bir QR bilet oluşturur.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold" style={{ backgroundColor: 'rgba(250, 158, 15, 0.1)', color: 'var(--accent-primary)' }}>
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Check-in</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Etkinlik girişinde QR kodunu organizatöre göster, sistem katılımını doğrular.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold" style={{ backgroundColor: 'rgba(250, 158, 15, 0.1)', color: 'var(--accent-primary)' }}>
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Sertifika</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Etkinlik sonrası, Polygon blockchain üzerinde Soulbound NFT sertifikan mint edilir.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-secondary text-white rounded-2xl p-8 text-center">
            <h2 className="font-heading font-semibold text-2xl mb-4">
              IT&MIS Kulübü
            </h2>
            <p className="text-white/90 mb-6">
              Işık Üniversitesi Information Technology & Management Information Systems Kulübü
            </p>
            <p className="text-sm text-white/80">
              Blockchain, Web3, Veri Bilimi ve Teknoloji alanlarında etkinlikler düzenliyoruz.
            </p>
          </div>
        </div>
      </main>
  );
}
