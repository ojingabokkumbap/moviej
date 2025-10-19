
import "@/styles/style.scss"
import "@/styles/reset.css"

import "@/app/globals.css";


import Header from "@/components/header";
import Footer from "@/components/Footer";
import { NotificationProvider } from "@/contexts/NotificationContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=1920, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>
        <NotificationProvider>
          <Header />
          {children}
          <Footer />
        </NotificationProvider>
      </body>
    </html>
  );
}
