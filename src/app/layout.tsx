import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';
import { Inter, PT_Sans } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'GeminiEstimate',
  description: 'AI-Powered Advanced Estimation Web App',
  manifest: '/manifest.json',
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-headline',
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#1E40AF" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={cn("font-body antialiased min-h-screen", inter.variable, ptSans.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
