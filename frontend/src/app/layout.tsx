import type { Metadata, Viewport } from 'next';
import './globals.css';
import MSWProvider from '@/provider/MSWProvider';
import { AuthGuard } from '@/provider/authGuard';
import HeaderWrapper from './header-wrapper';

const APP_NAME = '콘끼리'; // 설치되는 이름
const APP_DEFAULT_TITLE = '콘끼리 - 콘서트를 더 즐겁게🎵'; // 탭 상단에 뜨는 설명
const APP_TITLE_TEMPLATE = '%s | 콘끼리 CONKIRI'; // 각 페이지 뒤에 뜨는 설명
const APP_DESCRIPTION = '콘서트 티켓팅부터, 관람 후 집 도착까지!'; // 웹사이트 설명

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    url: 'https://i12b207.p.ssafy.io/',
    images: [
      {
        url: 'https://i12b207.p.ssafy.io/images/thumbnail.png',
        width: 1200,
        height: 630,
        alt: APP_DEFAULT_TITLE,
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log('Hotjar initialization started');
              (function (c, s, q, u, a, r, e) {
                c.hj=c.hj||function(){(c.hj.q=c.hj.q||[]).push(arguments)};
                c._hjSettings = { hjid: a };
                r = s.getElementsByTagName('head')[0];
                e = s.createElement('script');
                e.async = true;
                e.src = q + c._hjSettings.hjid + u;
                e.onload = function() {
                  console.log('Hotjar script loaded successfully');
                };
                e.onerror = function() {
                  console.error('Failed to load Hotjar script');
                };
                r.appendChild(e);
              })(window, document, 'https://static.hj.contentsquare.net/c/csq-', '.js', ${process.env.NEXT_PUBLIC_HOTJAR_ID});
            `,
          }}
        />  
      </head>
      <body className="flex h-[100dvh] flex-col overflow-hidden bg-web bg-cover bg-center font-pretendard">
        <MSWProvider />
        <div className="container relative flex h-[100dvh] max-w-layout flex-1 flex-col bg-white p-0 shadow-lg">
          <AuthGuard>
            <HeaderWrapper />
            <main className="flex-1 overflow-auto">{children}</main>
          </AuthGuard>
        </div>
      </body>
    </html>
  );
}
