"use client";
import React, { useState } from "react";
import { api } from "@/lib/api";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (email: string, password: string) => void;
  onOpenSignUp?: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onOpenSignUp,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "findId" | "findPassword">(
    "login"
  );
  const [nickname, setNickname] = useState("");
  const [findEmail, setFindEmail] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "login") {
      try {
        const response = await api.post("/users/login", { email, password });
        console.log("로그인 응답:", response.data);

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userEmail", response.data.email || email);
        localStorage.setItem("userNickname", response.data.nickname);

        window.dispatchEvent(new Event("storage"));
        onClose();
      } catch (error) {
        console.error("로그인 실패:", error);
        alert("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
      }
    } else if (mode === "findId") {
      try {
        const response = await api.post("/users/find-id", { nickname });
        alert(`해당 닉네임의 이메일: ${response.data.email}`);
        setMode("login");
      } catch (error) {
        console.error("아이디 찾기 실패:", error);
        alert("해당 닉네임을 찾을 수 없습니다.");
      }
    } else if (mode === "findPassword") {
      try {
        const response = await api.post("/users/find-password", {
          email: findEmail,
        });
        alert("임시 비밀번호가 이메일로 발송되었습니다.");
        setMode("login");
      } catch (error) {
        console.error("비밀번호 찾기 실패:", error);
        alert("해당 이메일을 찾을 수 없습니다.");
      }
    }
  };


  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-xl px-14 py-10 w-full max-w-md mx-4 relative h-96">
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
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {mode === "login" && "로그인"}
            {mode === "findId" && "아이디 찾기"}
            {mode === "findPassword" && "비밀번호 찾기"}
          </h2>
          <p className="text-gray-600">
            {mode === "login" && "로그인 하고 영화 취향을 알아보세요"}
            {mode === "findId" && "등록한 닉네임으로 이메일을 찾아드립니다"}
            {mode === "findPassword" && "등록한 이메일로 비밀번호를 발송합니다"}
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "login" && (
            <>
              <div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-3 border rounded-lg border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="이메일"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-3 border rounded-lg border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="비밀번호"
                  required
                />
              </div>
            </>
          )}

          {mode === "findId" && (
            <div>
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full mt-10 px-3 py-3 border rounded-lg border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="닉네임을 입력하세요"
                required
              />
            </div>
          )}

          {mode === "findPassword" && (
            <div>
              <input
                type="email"
                id="findEmail"
                value={findEmail}
                onChange={(e) => setFindEmail(e.target.value)}
                className="w-full mt-10 px-3 py-3 border rounded-lg border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="이메일을 입력하세요"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            {mode === "login" && "로그인"}
            {mode === "findId" && "아이디 찾기"}
            {mode === "findPassword" && "비밀번호 찾기"}
          </button>
        </form>

        {/* 아이디/비밀번호 찾기 및 회원가입 버튼 */}
        {mode === "login" && (
          <>
            {/* 아이디/비밀번호 찾기 */}
            <div className="mt-6 mb-4 flex justify-center gap-4">
              <button
                type="button"
                onClick={() => setMode("findId")}
                className=" text-gray-600 hover:text-purple-600"
              >
                아이디 찾기
              </button>
              <span className="text-gray-200">|</span>
              <button
                type="button"
                onClick={() => setMode("findPassword")}
                className=" text-gray-600 hover:text-purple-600"
              >
                비밀번호 찾기
              </button>
              <span className="text-gray-200">|</span>
              <button
                type="button"
                onClick={onOpenSignUp}
                className="ml-1 text-purple-600  hover:text-purple-700  font-medium"
              >
                회원가입
              </button>
            </div>
          </>
        )}

        {/* 뒤로가기 (아이디/비밀번호 찾기 모드일 때) */}
        {(mode === "findId" || mode === "findPassword") && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-sm text-gray-600 hover:text-purple-600"
            >
              ← 로그인으로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
