
'use client';

import AuthForm from '@/components/auth-form';
import MarketPriceAnalysis from '@/components/market-price-analysis';
import PdfEstimationTool from '@/components/pdf-estimation-tool';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function LoginPage() {
  const [isLoginFocused, setIsLoginFocused] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div
        className={cn(
          'grid w-full max-w-6xl items-center gap-8 transition-all duration-700 ease-in-out lg:grid-cols-2'
        )}
      >
        {/* Features on the left */}
        <div
          className={cn(
            'order-2 flex flex-col items-center gap-8 transition-all duration-500 lg:order-1',
            {
              'lg:scale-95 lg:opacity-75': isLoginFocused,
            }
          )}
        >
          <div className="w-full">
            <MarketPriceAnalysis />
          </div>
          <div className="w-full">
            <PdfEstimationTool />
          </div>
        </div>

        {/* Auth form on the right */}
        <div
          className={cn(
            'order-1 flex items-center justify-center transition-all duration-700 ease-in-out lg:order-2'
          )}
          onFocusCapture={() => setIsLoginFocused(true)}
          onBlurCapture={() => setIsLoginFocused(false)}
        >
          <AuthForm mode="login" />
        </div>
      </div>
    </div>
  );
}
