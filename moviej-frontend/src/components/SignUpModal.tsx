"use client";
import { api } from "@/lib/api";
import React, { useState, useEffect } from "react";
import { useNotification } from "@/contexts/NotificationContext";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp?: (email: string, nickname: string, password: string) => void;
  onOpenLogin?: () => void;
}

export default function SignUpModal({
  isOpen,
  onClose,
  onOpenLogin,
}: SignUpModalProps) {
  const { showNotification } = useNotification();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setNickname("");
      setPassword("");
      setConfirmPassword("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 비밀번호 확인 검증
    if (password !== confirmPassword) {
      showNotification("비밀번호가 일치하지 않습니다.", "error");
      return;
    }

    try {
      const response = await api.post("/users/signup", {
        email,
        nickname,
        password,
      });

      showNotification(response.data.message || "회원가입이 완료되었습니다!", "success");

      // 회원가입 성공 후 폼 초기화 및 모달 닫기
      setEmail("");
      setNickname("");
      setPassword("");
      setConfirmPassword("");
      onClose();
    } catch (error: any) {
      // 백엔드에서 error 필드로 메시지 반환 시
      const errorMsg =
        error.response?.data?.error ||
        "회원가입에 실패했습니다. 다시 시도해주세요.";
      showNotification(errorMsg, "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl px-14 py-8 w-full max-w-md mx-4 relative">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* 헤더 */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">회원가입</h2>
          <p className="text-gray-600">계정을 만들고 영화 추천을 받아보세요</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 pt-6 pb-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
            />
            <span className="absolute left-3 top-4 text-xs transform -translate-y-1/2 text-gray-500 pointer-events-none">
              이메일
            </span>
          </div>
          <div className="relative">
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-3 pt-6 pb-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
            />
            <span className="absolute left-3 top-4 text-xs transform -translate-y-1/2 text-gray-500 pointer-events-none">
              닉네임
            </span>
          </div>

          <div className="relative">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 pt-6 pb-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
            />
            <span className="absolute left-3 top-4 text-xs transform -translate-y-1/2 text-gray-500 pointer-events-none">
              비밀번호
            </span>
          </div>

          <div className="relative">
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 pt-6 pb-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
            />
            <span className="absolute left-3 top-4 text-xs transform -translate-y-1/2 text-gray-500 pointer-events-none">
              비밀번호 확인
            </span>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            회원가입
          </button>
        </form>

        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>
        </div>

        {/* 로그인 페이지로 이동 */}
        <div className="mt-2 text-center">
          <p className="text-gray-600">
            이미 계정이 있으신가요?
            <button
              type="button"
              onClick={() => {
                if (onOpenLogin) {
                  onOpenLogin();
                  onClose(); // 회원가입 모달 닫기
                }
              }}
              className="ml-1 text-purple-600 hover:text-purple-700 font-medium"
            >
              로그인
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
