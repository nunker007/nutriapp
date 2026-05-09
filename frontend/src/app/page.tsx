'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadUser } from '../lib/userStore';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = loadUser();
    router.replace(user ? '/dashboard' : '/onboarding');
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="spinner-circle" />
    </div>
  );
}
