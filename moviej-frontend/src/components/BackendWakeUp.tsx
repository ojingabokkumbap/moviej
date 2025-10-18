"use client";

import { useEffect } from "react";
import { wakeUpBackend } from "@/lib/wakeUpBackend";

/**
 * 앱이 로드될 때 백엔드 서버를 깨우는 컴포넌트
 * Onrender 무료 플랜의 sleep 모드 대응
 */
export default function BackendWakeUp() {
  useEffect(() => {
    // 앱이 처음 로드될 때 백엔드 서버를 깨움
    wakeUpBackend();
  }, []);

  return null; // UI를 렌더링하지 않음
}
