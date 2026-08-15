import crypto from 'crypto';

const SECRET_KEY = 'PoP_Secret_2025_IT_MIS_Club';

export function generateTicketCode(): string {
  return `TCKT-${crypto.randomBytes(2).toString('hex').toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
}

export function generateQRPayload(ticket: string, event_id: string, user_id: string): string {
  const exp = Math.floor(Date.now() / 1000) + 5400; // 90 minutes
  const dataString = `${ticket}|${event_id}|${user_id}|${exp}`;
  const sig = crypto.createHmac('sha256', SECRET_KEY).update(dataString).digest('hex');
  
  const payload = {
    ticket,
    event_id,
    user_id,
    exp,
    sig,
  };
  
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function verifyQRPayload(payload: string): { valid: boolean; data?: any; error?: string } {
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    const { ticket, event_id, user_id, exp, sig } = decoded;
    
    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (exp < now) {
      return { valid: false, error: 'QR kodu süresi dolmuş' };
    }
    
    // Verify signature
    const dataString = `${ticket}|${event_id}|${user_id}|${exp}`;
    const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(dataString).digest('hex');
    
    if (sig !== expectedSig) {
      return { valid: false, error: 'Geçersiz QR imzası' };
    }
    
    return { valid: true, data: decoded };
  } catch (error) {
    return { valid: false, error: 'Geçersiz QR formatı' };
  }
}

export function generateCertificateNo(date: string): string {
  const dateStr = date.replace(/[-:]/g, '').slice(0, 8);
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `POP-${dateStr}-${random}`;
}

export function generateMockIPFS(): string {
  return `ipfs://bafy${crypto.randomBytes(32).toString('hex')}`;
}

export function generateMockTxHash(): string {
  return `0x${crypto.randomBytes(32).toString('hex')}`;
}

export function generateMockTokenId(): string {
  return Math.floor(Math.random() * 100000).toString();
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
