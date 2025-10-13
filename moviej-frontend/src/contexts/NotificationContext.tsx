"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import NotificationToast from "@/components/NotificationToast";

interface NotificationContextType {
  showNotification: (message: string, type?: "success" | "error" | "info" | "warning") => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationState {
  message: string;
  type: "success" | "error" | "info" | "warning";
  isVisible: boolean;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<NotificationState>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const showNotification = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
    setNotification({
      message,
      type,
      isVisible: true,
    });
  };

  const closeNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false,
    }));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <NotificationToast
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={closeNotification}
      />
    </NotificationContext.Provider>
  );
}
