import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const certificate_no = searchParams.get('certificate_no');
    const tx_hash = searchParams.get('tx_hash');

    if (!certificate_no && !tx_hash) {
      return NextResponse.json(
        { error: 'Sertifika numarası veya işlem hash\'i gerekli' },
        { status: 400 }
      );
    }

    let certificate = null;

    if (certificate_no) {
      certificate = await prisma.certificate.findFirst({
        where: { certificate_no },
        include: {
          event: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      });
    } else if (tx_hash) {
      certificate = await prisma.certificate.findFirst({
        where: { tx_hash },
        include: {
          event: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      });
    }

    if (!certificate) {
      return NextResponse.json(
        { error: 'Sertifika bulunamadı' },
        { status: 404 }
      );
    }

    // Format response
    return NextResponse.json({
      valid: certificate.revoked_at === null,
      certificate: {
        id: certificate.id,
        certificate_no: certificate.certificate_no,
        ipfs_cid: certificate.ipfs_cid,
        chain: certificate.chain,
        contract_address: certificate.contract_address,
        token_id: certificate.token_id,
        tx_hash: certificate.tx_hash,
        minted_at: certificate.minted_at.toISOString(),
        revoked_at: certificate.revoked_at?.toISOString() || null,
      },
      event: {
        id: certificate.event.id,
        title: certificate.event.title,
        slug: certificate.event.slug,
        description: certificate.event.description,
        start_at: certificate.event.start_at.toISOString(),
        end_at: certificate.event.end_at.toISOString(),
        location: certificate.event.location,
        cover_url: certificate.event.cover_url,
      },
      user: {
        name: certificate.user.name,
      },
    });
  } catch (error) {
    console.error('Certificate verification error:', error);
    return NextResponse.json(
      { error: 'Doğrulama başarısız' },
      { status: 500 }
    );
  }
}
