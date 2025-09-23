"use client";
import React, { useState } from "react";
import LoginModal from "@/components/LoginModal";
import SignUpModal from "@/components/SignUpModal";

export default function TasteMovies() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleLogin = (email: string, password: string) => {
    // console.log("로그인 시도:", email, password);
    // 여기에 실제 로그인 로직 구현
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSignUp = (email: string, nickname: string, password: string) => {
    // console.log("회원가입 시도:", email, nickname, password);
    // 여기에 실제 회원가입 로직 구현
  };

  const openSignUpModal = () => {
    setIsLoginModalOpen(false);
    setIsSignUpModalOpen(true);
  };

  const openLoginModal = () => {
    setIsSignUpModalOpen(false);
    setIsLoginModalOpen(true);
  };

  return (
    <div className="px-12">
      <div className="flex justify-between items-center mb-4 px-16 py-8 rounded-xl bg-gradient-to-r from-indigo-900 to-violet-900">
        <div className="w-full">
          <p className="text-3xl font-semibold text-left mb-1 text-white">
            로그인하고 내 취향영화 알아보자
          </p>
          <p className="text-xl font-light text-left text-white">
            맞춤형 추천으로 새로운 영화를 알아보세요.
          </p>
        </div>
        <button 
          onClick={() => setIsLoginModalOpen(true)}
          className="bg-white text-blue-950 font-bold px-10 py-4 rounded-xl tracking-wider text-2xl hover:bg-violet-800 hover:text-white transition"
        >
          로그인
        </button>
      </div>
      
      {/* 로그인 모달 */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        onOpenSignUp={openSignUpModal}
      />
      
      {/* 회원가입 모달 */}
      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        onSignUp={handleSignUp}
        onOpenLogin={openLoginModal}
      />
      
      {/* 내취향영화리스트 */}
      {/* 
      <div>
        <p className="text-3xl font-semibold text-left mb-5">내 취향 영화</p>
      </div> 
      */}
    </div>
  );
}
