"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { api } from "@/lib/api";

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountSettingsModal({
  isOpen,
  onClose,
}: AccountSettingsModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 모달이 열릴 때 현재 사용자 정보 불러오기
  useEffect(() => {
    if (isOpen) {
      if (typeof window !== "undefined") {
        const userEmail = localStorage.getItem("userEmail") || "";
        const userNickname = localStorage.getItem("userNickname") || "";
        const userProfileImage = localStorage.getItem("userProfileImage") || "";
        setEmail(userEmail);
        setNickname(userNickname);
        setProfileImage(userProfileImage || null);
      }
    } else {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNickname("");
      setEmail("");
      setProfileImage(null);
      setSelectedFile(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 프로필 이미지 파일 선택 핸들러
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // 미리보기용 URL 생성
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  // 프로필 이미지 제거
  const removeProfileImage = () => {
    setProfileImage(null);
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 비밀번호 변경 시에만 검증
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        alert("비밀번호를 변경하려면 모든 비밀번호 필드를 입력하세요.");
        return;
      }
      if (newPassword !== confirmPassword) {
        alert("새 비밀번호가 일치하지 않습니다.");
        return;
      }
    }

    // 변경할 것이 없으면 알림
    if (!selectedFile && !newPassword) {
      alert("변경할 정보를 입력하세요.");
      return;
    }

    setIsLoading(true);
    try {
      let updatedImage = false;
      let updatedPassword = false;

      // 프로필 이미지 업로드 (선택사항)
      if (selectedFile) {
        if (selectedFile.size > 2 * 1024 * 1024) {
          alert("이미지 파일은 2MB 이하만 업로드 가능합니다.");
          setIsLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("email", email); 

        const imageResponse = await api.post("/users/profile-image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // 업로드된 이미지 URL을 localStorage에 저장
        if (imageResponse.data?.profileImage) {
          localStorage.setItem("userProfileImage", imageResponse.data.profileImage);
          setProfileImage(imageResponse.data.profileImage);
          updatedImage = true;
        }
      }

      // 비밀번호 변경 처리 (선택사항)
      if (newPassword) {
        await api.post("/users/update-password", {
          email,
          currentPassword,
          newPassword,
        });
        updatedPassword = true;
      }

      // 상태 동기화
      window.dispatchEvent(new Event("storage"));

      // 성공 메시지
      let message = "계정 정보가 성공적으로 변경되었습니다.";
      if (updatedImage && updatedPassword) {
        message = "프로필 이미지와 비밀번호가 변경되었습니다.";
      } else if (updatedImage) {
        message = "프로필 이미지가 변경되었습니다.";
      } else if (updatedPassword) {
        message = "비밀번호가 변경되었습니다.";
      }

      alert(message);
      onClose();
      window.location.reload();

    } catch (error: any) {
      console.error("계정 정보 변경 실패:", error);
      const errorMsg =
        error?.response?.data?.error ||
        error?.message ||
        "계정 정보 변경에 실패했습니다.";
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // 저장 중에는 배경 클릭으로 닫히지 않도록 보호
    if (isLoading) return;
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-xl px-8 py-8 w-full max-w-md mx-4 relative"
        // 내부 클릭이 배경 클릭으로 전달되지 않도록 차단
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          disabled={isLoading}
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
        <div className="text-left mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">계정 설정</h2>
        </div>

        {/* 프로필 이미지 섹션 */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-200 border border-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="프로필 이미지"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 font-medium text-3xl">
                  {nickname?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </div>
            {/* {profileImage && (
              <button
                type="button"
                onClick={removeProfileImage}
                className="absolute bottom-4 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z" />
                </svg>
              </button>
            )} */}
            <div className="mt-4 flex gap-2">
              <label className="absolute bottom-4 right-0 w-8 h-8 bg-violet-500 text-white rounded-full flex items-center justify-center hover:bg-violet-600 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M12 5l0 14" />
                  <path d="M5 12l14 0" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
            </div>
          </div>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이메일 (수정 불가) */}
          <div className="relative">
            <input
              type="email"
              value={email}
              className="w-full px-3 pt-6 pb-1 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
              disabled
            />
            <span className="absolute left-3 top-4 text-xs transform -translate-y-1/2 text-gray-500 pointer-events-none">
              이메일
            </span>
          </div>

          {/* 닉네임 */}
          <div className="relative">
            <input
              type="text"
              value={nickname}
              className="w-full px-3 pt-6 pb-1 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
              disabled
            />
            <span className="absolute left-3 top-4 text-xs transform -translate-y-1/2 text-gray-500 pointer-events-none">
              닉네임
            </span>
          </div>

          {/* 구분선 */}
          <div className="pt-1">
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                비밀번호 변경
              </h3>
            </div>
          </div>

          {/* 현재 비밀번호 */}
          <div className="relative">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 pt-6 pb-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
            />
            <span className="absolute left-3 top-4 text-xs transform -translate-y-1/2 text-gray-500 pointer-events-none">
              현재 비밀번호
            </span>
          </div>

          {/* 새 비밀번호 */}
          <div className="relative">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 pt-6 pb-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
            />
            <span className="absolute left-3 top-4 text-xs transform -translate-y-1/2 text-gray-500 pointer-events-none">
              새 비밀번호
            </span>
          </div>

          {/* 새 비밀번호 확인 */}
          <div className="relative">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 pt-6 pb-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
            />
            <span className="absolute left-3 top-4 text-xs transform -translate-y-1/2 text-gray-500 pointer-events-none">
              새 비밀번호 확인
            </span>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-all"
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
            >
              {isLoading ? "저장 중" : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
