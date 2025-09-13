
import "@/styles/style.scss"
import "@/styles/reset.css"

import "@/app/globals.css";


import Header from "@/components/header";
import MovieChatBot from "@/components/MovieChatBot";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Header />
        {children}
        <MovieChatBot />
      </body>
    </html>
  );
}
