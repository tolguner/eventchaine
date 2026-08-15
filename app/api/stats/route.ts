import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Toplam kullanıcı sayısı
    const totalUsers = await prisma.user.count();

    // Tamamlanan etkinlik sayısı (bitiş tarihi geçmiş)
    const completedEvents = await prisma.event.count({
      where: {
        end_at: {
          lt: new Date()
        }
      }
    });

    // Dağıtılan sertifika sayısı
    const totalCertificates = await prisma.certificate.count({
      where: {
        revoked_at: null
      }
    });

    // Toplam check-in sayısı
    const totalCheckins = await prisma.checkIn.count();

    // Toplam kayıt sayısı
    const totalRegistrations = await prisma.registration.count();

    return NextResponse.json({
      total_users: totalUsers,
      completed_events: completedEvents,
      total_certificates: totalCertificates,
      total_checkins: totalCheckins,
      total_registrations: totalRegistrations,
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { error: 'İstatistikler alınamadı' },
      { status: 500 }
    );
  }
}
