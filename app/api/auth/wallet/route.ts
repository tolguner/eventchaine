import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { address, signature, message, walletType } = await req.json();

    if (!address || !signature) {
      return NextResponse.json(
        { error: 'Cüzdan adresi ve imza gerekli' },
        { status: 400 }
      );
    }

    // In a real app, you would verify the signature here
    // For now, we'll create/find user by wallet address

    // Admin email listesi
    const ADMIN_EMAILS = ['tolgaolguner1@gmail.com'];
    
    // Check if wallet exists
    let wallet = await prisma.wallet.findUnique({
      where: { address },
      include: { user: true },
    });
    
    let user;
    
    if (wallet) {
      // Wallet exists, use the associated user
      user = wallet.user;
      
      // Update last used time
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { last_used_at: new Date() },
      });
    } else {
      // New wallet - create new user with this wallet
      const newEmail = `wallet_${address.slice(0, 8)}@temp.com`;
      const detectedWalletType = walletType || 'Unknown';
      
      user = await prisma.user.create({
        data: {
          id: `u_${address.slice(0, 8)}`,
          email: newEmail,
          name: 'Yeni Kullanıcı',
          role: 'user',
          wallets: {
            create: {
              address,
              wallet_type: detectedWalletType,
              is_primary: true,
            },
          },
        },
        include: {
          wallets: true,
        },
      });
      
      // Set primary wallet
      const primaryWallet = user.wallets.find((w: any) => w.is_primary);
      if (primaryWallet) {
        await prisma.user.update({
          where: { id: user.id },
          data: { primary_wallet_id: primaryWallet.id },
        });
      }
    }
    
    // Admin kontrolü - eğer kullanıcının email'i admin listesindeyse, role'ü güncelle
    if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      if (user.role !== 'admin') {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: 'admin' },
        });
      }
    }

    // Create session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.session.create({
      data: {
        token,
        user_id: user.id,
        expires_at: expiresAt,
      },
    });

    return NextResponse.json({
      token,
      user,
    });
  } catch (error) {
    console.error('Wallet auth error:', error);
    return NextResponse.json(
      { error: 'Kimlik doğrulama başarısız' },
      { status: 500 }
    );
  }
}
