// @vitest-environment jsdom
//
// Bu dosya JSX yerine React.createElement kullanıyor. Sebebi: projenin
// tsconfig'i Next.js için "jsx": "preserve" kullanıyor ve vitest'in
// transformer'ı bunu okuyup JSX'i dönüştürmeden bırakıyor. JSX yalnızca
// sözdizimsel kolaylık olduğu için testin kapsamı bundan etkilenmiyor.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createElement } from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BeaconCheckin from './BeaconCheckin';

function renderBeacon(props = { eventId: 'e_101', userId: 'u_1' }) {
  return render(createElement(BeaconCheckin, props));
}

function mockFetch(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

// BeaconCheckin, isteği atmadan önce ~1.5sn'lik bir "tarama" animasyonu
// bekliyor. Sahte zamanlayıcı bu beklemeyi userEvent ile birlikte güvenilir
// şekilde ilerletemediği için gerçek zamanlayıcı kullanılıyor; bunun yerine
// beklemeler aşağıdaki WAIT_MS ile uzatıldı.
const WAIT_MS = 4000;

afterEach(() => {
  // vitest `globals: false` ile çalıştığı için RTL'in otomatik cleanup'ı
  // devreye girmiyor; elle temizlenmezse önceki render'lar DOM'da kalıyor.
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function setupUser() {
  return userEvent.setup();
}

describe('BeaconCheckin', () => {
  it('başarılı check-in sonrası başarı mesajı gösterir ve doğru istek atar', async () => {
    const fetchMock = mockFetch(200, { message: 'Beacon ile check-in başarılı' });
    const user = setupUser();

    renderBeacon();
    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText(/check-in başarılı/i)).toBeTruthy();
    }, { timeout: WAIT_MS });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/checkin/beacon');

    const sent = JSON.parse(options.body);
    expect(sent).toMatchObject({ user_id: 'u_1', event_id: 'e_101' });
    // Backend'in doğruladığı nonce formatına uymalı
    // (bkz. app/api/checkin/beacon/route.ts)
    expect(sent.beacon_nonce).toMatch(/^BEACON-[A-Z0-9]{8}$/);
  });

  it('409 (zaten check-in yapılmış) durumunu ayrı mesajla gösterir', async () => {
    mockFetch(409, { error: 'Zaten check-in yapılmış' });
    const user = setupUser();

    renderBeacon();
    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText(/zaten check-in yaptınız/i)).toBeTruthy();
    }, { timeout: WAIT_MS });
  });

  it('hata durumunda API mesajını gösterir ve buton tekrar denenebilir kalır', async () => {
    mockFetch(403, { error: 'Kullanıcı bu etkinliğe kayıtlı değil' });
    const user = setupUser();

    renderBeacon();
    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText(/kayıtlı değil/i)).toBeTruthy();
    }, { timeout: WAIT_MS });
    // Başarıda buton kayboluyor; hatada kalmalı ki tekrar denenebilsin
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('her tıklamada farklı bir nonce üretir', async () => {
    const fetchMock = mockFetch(403, { error: 'hata' });
    const user = setupUser();

    renderBeacon();

    await user.click(screen.getByRole('button'));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1), { timeout: WAIT_MS });
    await user.click(screen.getByRole('button'));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2), { timeout: WAIT_MS });

    const nonce1 = JSON.parse(fetchMock.mock.calls[0][1].body).beacon_nonce;
    const nonce2 = JSON.parse(fetchMock.mock.calls[1][1].body).beacon_nonce;
    expect(nonce1).not.toBe(nonce2);
  });
});
