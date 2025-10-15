
import "@/styles/style.scss"
import "@/styles/reset.css"

import "@/app/globals.css";


import Header from "@/components/header";
import MovieChatBot from "@/components/MovieChatBot";
import { NotificationProvider } from "@/contexts/NotificationContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
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
