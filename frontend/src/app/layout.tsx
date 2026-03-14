import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'عالم الدراسة | Study World',
  description: 'منصة تعليمية ممتعة للطلاب السعوديين - الصف الثالث الابتدائي',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-arabic antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
