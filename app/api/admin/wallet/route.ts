import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAILS = ['tolgaolguner1@gmail.com'];

// Admin cüzdan adresini getir
export async function GET(request: NextRequest) {
  try {
    // Admin kullanıcıyı bul
    const adminUser = await prisma.user.findFirst({
      where: {
        email: {
          in: ADMIN_EMAILS
        }
      },
      include: {
        wallets: {
          where: {
            is_primary: true
          },
          take: 1
        }
      }
    });

    if (!adminUser || !adminUser.wallets || adminUser.wallets.length === 0) {
      // Eğer admin cüzdanı yoksa, tüm admin cüzdanlarını kontrol et
      const adminWallet = await prisma.wallet.findFirst({
        where: {
          user: {
            email: {
              in: ADMIN_EMAILS
            }
          }
        },
        orderBy: {
          connected_at: 'desc'
        }
      });

      if (!adminWallet) {
        return NextResponse.json(
          { error: 'Admin cüzdanı bulunamadı' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        wallet_address: adminWallet.address,
        wallet_type: adminWallet.wallet_type
      });
    }

    return NextResponse.json({
      wallet_address: adminUser.wallets[0].address,
      wallet_type: adminUser.wallets[0].wallet_type
    });
  } catch (error) {
    console.error('Admin wallet fetch error:', error);
    return NextResponse.json(
      { error: 'Veri alınamadı' },
      { status: 500 }
    );
  }
}
