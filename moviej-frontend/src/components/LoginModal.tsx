"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useNotification } from "@/contexts/NotificationContext";
import { useRouter } from "next/navigation";

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
  const { showNotification } = useNotification();
  const [email, setEmail] = useState("");
  const router = useRouter();
  const [rememberEmail, setRememberEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "findId" | "findPassword">(
    "login"
  );
  const [nickname, setNickname] = useState("");
  const [findEmail, setFindEmail] = useState("");
  const [findIdResult, setFindIdResult] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setEmail(localStorage.getItem("rememberEmail") || "");
      setRememberEmail(!!localStorage.getItem("rememberEmail"));
      setPassword("");
      setMode("login");
      setNickname("");
      setFindEmail("");
      setFindIdResult("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "login") {
      try {
        // 아이디 기억하기
        if (rememberEmail) {
          localStorage.setItem("rememberEmail", email);
        } else {
          localStorage.removeItem("rememberEmail");
        }

        const response = await api.post("/users/login", { email, password });

        console.log("=== 로그인 응답 디버깅 ===");
        console.log("응답 데이터:", response.data);
        console.log("userId:", response.data.userId);

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userEmail", response.data.email || email);
        localStorage.setItem("userNickname", response.data.nickname);
        localStorage.setItem(
          "userProfileImage",
          response.data.profileImage || ""
        );
        localStorage.setItem("userId", response.data.userId?.toString() || "");

        console.log("저장된 userId:", localStorage.getItem("userId"));

        window.dispatchEvent(new Event("storage"));
        showNotification("로그인되었습니다.", "success");
        onClose();

        const userId = response.data.userId;
        if (userId) {
          try {
            const prefRes = await api.get(
              `/users/user-preferences/check?userId=${userId}`
            );
            // 200이면 홈으로
            if (prefRes.status === 200) {
              router.push("/home");
            } else {
              // 200이 아니면 온보딩으로
              router.replace("/onboarding");
            }
          } catch (err: any) {
            // 404 또는 204면 온보딩, 그 외는 홈
            if (
              err?.response?.status === 404 ||
              err?.response?.status === 204
            ) {
              router.replace("/onboarding");
            } else {
              router.push("/home");
            }
          }
        }
        
      } catch (error) {
        console.error("로그인 실패:", error);
        showNotification(
          "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.",
          "error"
        );
      }
    } else if (mode === "findId") {
      try {
        const response = await api.get(
          `/users/find-email?nickname=${nickname}`
        );
        setFindIdResult(response.data.email);
      } catch (error) {
        setFindIdResult("");
        console.error("아이디 찾기 실패:", error);
        showNotification("해당 닉네임을 찾을 수 없습니다.", "error");
      }
    } else if (mode === "findPassword") {
      try {
        await api.post("/users/password-reset-request", {
          email: findEmail,
        });
        showNotification("임시 비밀번호가 이메일로 발송되었습니다.", "success");
        setMode("login");
      } catch (error) {
        console.error("비밀번호 찾기 실패:", error);
        showNotification("해당 이메일을 찾을 수 없습니다.", "error");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl px-14 py-14 w-full max-w-md mx-4 relative ">
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
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 pt-6 pb-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 bg-white"
                  placeholder="이메일"
                  required
                />
                <span className="absolute left-3 top-4 text-xs transform -translate-y-1/2 text-gray-500 pointer-events-none">
                  이메일
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 pt-6 pb-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 bg-white"
                  required
                />
                <span className="absolute left-3 top-4 text-xs transform -translate-y-1/2 text-gray-500 pointer-events-none">
                  비밀번호
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberEmail"
                  checked={rememberEmail}
                  onChange={(e) => setRememberEmail(e.target.checked)}
                />
                <label
                  htmlFor="rememberEmail"
                  className="text-sm text-gray-600"
                >
                  아이디 기억하기
                </label>
              </div>
            </>
          )}

          {mode === "findId" && (
            <>
              <div className="relative">
                <input
                  type="text"
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3 pt-6 pb-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 bg-white"
                  required
                />
                <span className="absolute left-3 top-4 text-xs transform -translate-y-1/2 text-gray-500 pointer-events-none">
                  닉네임
                </span>
              </div>
              {findIdResult && (
                <>
                  <div className="mt-4 text-center ">
                    <p className="text-gray-600 text-sm">
                      검색결과 해당하는 이메일은
                    </p>
                    <span className="text-purple-500 text-lg font-semibold">
                      {findIdResult}
                    </span>
                    <span className="text-gray-600 text-sm">입니다.</span>
                  </div>
                </>
              )}
            </>
          )}

          {mode === "findPassword" && (
            <div className="relative">
              <input
                type="email"
                id="findEmail"
                value={findEmail}
                onChange={(e) => setFindEmail(e.target.value)}
                className="w-full px-3 pt-6 pb-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 bg-white"
                required
              />
              <span className="absolute left-3 top-4 text-xs transform -translate-y-1/2 text-gray-500 pointer-events-none">
                이메일
              </span>
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
                className=" text-gray-600 hover:text-purple-600 "
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
          <>
            {" "}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">또는</span>
                </div>
              </div>
            </div>
            <div className="mt-2 text-center">
              <p className="text-gray-600">
                이미 계정이 있으신가요?
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="ml-1 text-purple-600 hover:text-purple-700 font-medium"
                >
                  로그인
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
