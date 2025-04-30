'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ClientOnlyProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
  skipLoader?: boolean;
}

/**
 * ClientOnlyProvider ensures content is only rendered on the client
 * to prevent hydration errors with date/time components and other
 * browser-specific features
 */
export default function ClientOnlyProvider({
  children,
  fallback,
  skipLoader = false
}: ClientOnlyProviderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient && skipLoader) {
    return null;
  }

  if (!isClient) {
    return (
      fallback || (
        <div className="flex items-center justify-center p-4 min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
          <span className="text-slate-400">Loading...</span>
        </div>
      )
    );
  }

  return <>{children}</>;
}