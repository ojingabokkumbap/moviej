"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal";
import SignUpModal from "@/components/SignUpModal";
import AccountSettingsModal from "@/components/AccountSettingsModal";

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  // 로그인 상태 관리
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userNickname, setUserNickname] = useState<string | null>(null);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("userProfileImage") : null
  );

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isAccountSettingsModalOpen, setIsAccountSettingsModalOpen] =
    useState(false);

  // 로그인 상태 초기화
  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
      setUserEmail(localStorage.getItem("userEmail"));
      setUserNickname(localStorage.getItem("userNickname"));
      setUserProfileImage(localStorage.getItem("userProfileImage"));
    };
    checkLogin();
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  // 검색창이 열릴 때 input에 포커스
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // TMDB API로 영화 검색
  const searchMovies = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
          query
        )}&language=ko-KR`
      );
      const data = await response.json();
      setSearchResults(data.results?.slice(0, 5) || []); // 최대 5개만 표시
    } catch (error) {
      console.error("영화 검색 오류:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 검색어 변경 시 디바운싱
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchMovies(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // 검색 토글
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  // 영화 선택 시
  const handleMovieSelect = (movieId: number) => {
    router.push(`/movie/${movieId}`);
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  // 검색창 외부 클릭 시 닫기
  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsSearchOpen(false);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  // 프로필 드롭다운 토글
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // 프로필 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 프로필 메뉴 아이템 클릭 핸들러
  const handleProfileMenuClick = (path: string) => {
    router.push(path);
    setIsProfileOpen(false);
  };

  {
    /* 로그인 모달 */
  }
  <LoginModal
    isOpen={isLoginModalOpen}
    onClose={() => setIsLoginModalOpen(false)}
  />;
  return (
    <>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onOpenSignUp={() => {
          setIsLoginModalOpen(false);
          setIsSignUpModalOpen(true);
        }}
      />
      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        onOpenLogin={() => {
          setIsSignUpModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
      <AccountSettingsModal
        isOpen={isAccountSettingsModalOpen}
        onClose={() => setIsAccountSettingsModalOpen(false)}
      />
      <header
        className="fixed top-0 left-0 w-full z-50"
        style={{
          background:
            "linear-gradient(to bottom, rgba(11,11,11,1) 0%, rgba(11,11,11,0.5) 50%, rgba(0,0,0,0) 100%)",
        }}
      >
        <div className="flex items-center justify-between px-10 py-4 w-full h-26 bg-transparent">
          <div className="w-fit">
            <Image src="/images/logo.svg" alt="Logo" width={85} height={50} />
          </div>
          <div className="flex items-center gap-10 w-7/12 justify-center">
            <Link href="/" className="text-white">
              홈
            </Link>
            <Link href="/movies" className="text-white">
              영화
            </Link>
            <Link href="/news" className="text-white">
              기사
            </Link>
            <Link href="/profile" className="text-white">
              내 정보
            </Link>
          </div>
          <div className="flex items-center gap-6 w-fit justify-end">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="icon icon-tabler icons-tabler-filled icon-tabler-bell"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M14.235 19c.865 0 1.322 1.024 .745 1.668a3.992 3.992 0 0 1 -2.98 1.332a3.992 3.992 0 0 1 -2.98 -1.332c-.552 -.616 -.158 -1.579 .634 -1.661l.11 -.006h4.471z" />
                <path d="M12 2c1.358 0 2.506 .903 2.875 2.141l.046 .171l.008 .043a8.013 8.013 0 0 1 4.024 6.069l.028 .287l.019 .289v2.931l.021 .136a3 3 0 0 0 1.143 1.847l.167 .117l.162 .099c.86 .487 .56 1.766 -.377 1.864l-.116 .006h-16c-1.028 0 -1.387 -1.364 -.493 -1.87a3 3 0 0 0 1.472 -2.063l.021 -.143l.001 -2.97a8 8 0 0 1 3.821 -6.454l.248 -.146l.01 -.043a3.003 3.003 0 0 1 2.562 -2.29l.182 -.017l.176 -.004z" />
              </svg>
            </div>
            <button onClick={toggleSearch}>
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <line
                    x1="21"
                    y1="21"
                    x2="16.65"
                    y2="16.65"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </button>

            {!isLoggedIn && (
              <button onClick={() => setIsLoginModalOpen(true)}>
                <div className="">
                  <p className="">로그인</p>
                </div>
              </button>
            )}
            <div className="relative" ref={profileRef}>
              {isLoggedIn && (
                <button
                  onClick={toggleProfile}
                  className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center overflow-hidden border border-gray-400"
                >
                  {userProfileImage ? (
                    <Image
                      src={userProfileImage}
                      alt="프로필 이미지"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover "
                    />
                  ) : (
                    <span className="text-white font-medium">
                      {userNickname?.charAt(0).toUpperCase() || "U"}
                    </span>
                  )}
                </button>
              )}
              {/* 프로필 드롭다운 메뉴 */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                  {/* 사용자 정보 섹션 */}
                  <div className="px-4 py-3 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center overflow-hidden border border-gray-400">
                        {userProfileImage ? (
                          <Image
                            src={userProfileImage}
                            alt="프로필 이미지"
                            width={45}
                            height={45}
                            className="w-full h-full object-cover "
                          />
                        ) : (
                          <span className="text-white font-medium">
                            {userNickname?.charAt(0).toUpperCase() || "U"}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{userNickname}</p>
                        <p className="text-gray-400 text-sm">{userEmail}</p>
                      </div>
                    </div>
                  </div>

                  {/* 메뉴 아이템들 */}
                  <div className="py-2">
                    <button
                      onClick={() => handleProfileMenuClick("/profile")}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      내 프로필
                    </button>

                    <button
                      onClick={() => {
                        setIsAccountSettingsModalOpen(true);
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      계정 설정
                    </button>

                    <button
                      onClick={() => handleProfileMenuClick("/reviews")}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                      내 리뷰
                    </button>

                    <button
                      onClick={() => handleProfileMenuClick("/watchlist")}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      관심 목록
                    </button>

                    <div className="border-t border-gray-700 mt-2 pt-2">
                      <button
                        onClick={() => {
                          localStorage.removeItem("token"); // 토큰 삭제
                          localStorage.removeItem("userEmail"); // 사용자 이메일 삭제
                          localStorage.removeItem("userNickname"); // 사용자 닉네임 삭제
                          localStorage.removeItem("userProfileImage"); // 프로필 이미지 삭제
                          setIsLoggedIn(false); // 상태 갱신
                          setUserEmail(null); // 이메일 상태 초기화
                          setUserNickname(null); // 닉네임 상태 초기화
                          setUserProfileImage(null); // 프로필 이미지 상태 초기화
                          setIsProfileOpen(false); // 드롭다운 닫기
                          window.dispatchEvent(new Event("storage")); // 상태 동기화
                          router.push("/"); // 홈으로 이동
                          alert("로그아웃 되었습니다.");
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        로그아웃
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* ===============비로그인 */}
            {/* 
          <Link href="/login" className="text-gray-100">
            로그인
          </Link> 
          */}
          </div>
        </div>
        {/* 검색 모달 */}
        {isSearchOpen && (
          <div
            className="fixed inset-0 z-[60] bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={handleClickOutside}
          >
            <div className="flex justify-center pt-20">
              <div className="bg-gray-900 border border-gray-700 rounded-xl max-h-full overflow-hidden w-[900px]">
                {/* 검색 입력창 */}
                <div className="p-4 border-b border-gray-700">
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="영화 제목을 검색하세요."
                      className="w-full bg-gray-500 text-white placeholder-gray-200 border border-gray-400 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-violet-500"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isLoading ? (
                        <div className="animate-spin w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full"></div>
                      ) : (
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="11" cy="11" r="8" strokeWidth="2" />
                          <line
                            x1="21"
                            y1="21"
                            x2="16.65"
                            y2="16.65"
                            strokeWidth="2"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {/* 검색 결과 */}
                <div className="max-h-full overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((movie) => (
                        <button
                          key={movie.id}
                          onClick={() => handleMovieSelect(movie.id)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 transition-colors text-left"
                        >
                          <div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0">
                            {movie.poster_path ? (
                              <Image
                                src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                                alt={movie.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                <svg
                                  className="w-6 h-6 text-gray-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white truncate">
                              {movie.title}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {movie.release_date
                                ? new Date(movie.release_date).getFullYear()
                                : "미정"}
                            </p>
                            {movie.vote_average > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                <svg
                                  className="w-3 h-3 text-yellow-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                                </svg>
                                <span className="text-xs text-gray-400">
                                  {movie.vote_average.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : searchQuery && !isLoading ? (
                    <div className="p-4 text-center text-gray-400">
                      검색 결과가 없습니다.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
