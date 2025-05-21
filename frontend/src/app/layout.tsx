import type { Metadata } from 'next';
import '@/assets/styles/globals.scss';
import styles from '@/app/layout.module.scss';
import { HeaderProvider } from '@/components/layout/Header/HeaderProvider';
import SideBar from '@/components/layout/Header/SideBar';
import { Providers } from './providers';
import ChatbotProvider from '@/components/chatbot/ChatbotProvider/ChatbotProvider';
import { NotificationProvider } from '@/components/notification/NotificationProvider';

const APP_NAME = '콘끼리'; // 설치되는 이름
const APP_DEFAULT_TITLE = '콘끼리 - 콘서트를 더 즐겁게🎵'; // 탭 상단에 뜨는 설명
const APP_TITLE_TEMPLATE = '%s | 콘끼리 CONKIRI'; // 각 페이지 뒤에 뜨는 설명
const APP_DESCRIPTION = '모두의 콘서트 도우미'; // 웹사이트 설명
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
    url: 'https://conkiri.shop/',
    images: [
      {
        url: 'https://conkiri.shop/images/thumbnail.png',
        width: 1200,
        height: 630,
        alt: APP_DEFAULT_TITLE,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ko'>
      <head></head>
      <body className={styles.body}>
        <Providers>
          <NotificationProvider />
          <ChatbotProvider>
            <HeaderProvider>
              <SideBar />
              <div className={styles.main}>{children}</div>
            </HeaderProvider>
          </ChatbotProvider>
        </Providers>
      </body>
    </html>
  );
}
