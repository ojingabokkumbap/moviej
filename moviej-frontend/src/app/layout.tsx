
import "@/styles/style.scss"
import "@/styles/reset.css"

import "@/app/globals.css";


import Header from "@/components/header";
import MovieChatBot from "@/components/MovieChatBot";
import { NotificationProvider } from "@/contexts/NotificationContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <title>이 페이지의 타이틀</title>
      <body>
        <NotificationProvider>
          <Header />
          {children}
          <MovieChatBot />
        </NotificationProvider>
      </body>
    </html>
  );
}
