'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUser } from '@/app/components/user-context';

export function useCoinBalance() {
  const user = useUser();
  const [balance, setBalance] = useState(user?.sl_coin ?? 0);

  const refreshBalance = useCallback(async () => {
    if (!user) return 0;
    try {
      const response = await fetch('/api/user/coin', { cache: 'no-store' });
      if (!response.ok) return null;
      const data = await response.json();
      const next = Number(data.sl_coin);
      if (Number.isFinite(next)) {
        setBalance(next);
        return next;
      }
    } catch {}
    return null;
  }, [user]);

  useEffect(() => {
    setBalance(user?.sl_coin ?? 0);
    void refreshBalance();
    const onFocus = () => { void refreshBalance(); };
    window.addEventListener('focus', onFocus);
    const timer = window.setInterval(() => { void refreshBalance(); }, 15000);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.clearInterval(timer);
    };
  }, [user, refreshBalance]);

  return { balance, refreshBalance };
}
