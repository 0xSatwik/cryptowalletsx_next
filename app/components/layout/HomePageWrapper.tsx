'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface HomePageWrapperProps {
  children: ReactNode;
}

export default function HomePageWrapper({ children }: HomePageWrapperProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  return (
    <main className={`flex-grow ${isHomePage ? 'pt-6' : 'pt-16 sm:pt-20'} pb-16`}>
      {children}
    </main>
  );
} 