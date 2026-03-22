import type { Metadata } from 'next';
import { Manrope, Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/providers/sonner';
import { ThemeSync } from '@/components/providers/theme-sync';
import { AuthProvider } from '@/lib/auth/auth-provider';
import { QueryProvider } from '@/lib/query-provider';
import '@/lib/validations/zod-config';
import './globals.css';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});


export const metadata: Metadata = {
  title: 'Sebo Stock Control',
  description: 'Sistema de controle de estoque para Sebo',
};

import { AccessibilityProvider } from '@/components/providers/accessibility-provider';
import { AccessibilityMenu } from '@/components/organisms/accessibility-menu';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${inter.variable} antialiased`}
      >
        <AccessibilityProvider />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <QueryProvider>
            <AuthProvider>
              <ThemeSync />
              {children}
              <AccessibilityMenu />
              <Toaster richColors position="top-right" />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
