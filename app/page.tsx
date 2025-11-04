// app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Saat user buka halaman utama, langsung redirect ke /products
    router.push('/products');
  }, [router]);

  return null; // Tidak perlu tampilan di halaman utama
}
