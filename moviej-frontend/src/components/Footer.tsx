"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* 로고 및 소개 */}
          <div>
            <Link href="/">
              <Image src="/images/logo.svg" alt="Logo" width={85} height={50} />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mt-5">
              개인화 기반 영화 추천 및 리뷰 플랫폼
              <br />
              당신의 취향에 맞는 영화를 찾아드립니다.
            </p>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h4 className="text-gray-200 font-semibold mb-4">빠른 이동</h4>
            <div className="flex gap-3 text-gray-400 items-center">
              <p>
                <Link
                  href="/home"
                  className="text-gray-400 hover:text-violet-400 transition-colors text-sm"
                >
                  홈
                </Link>
              </p>
              <div className="w-px h-3 bg-gray-700" />
              <p>
                <Link
                  href="/movies"
                  className="text-gray-400 hover:text-violet-400 transition-colors text-sm"
                >
                  영화
                </Link>
              </p>
              <div className="w-px h-3 bg-gray-700" />
              <p>
                <Link
                  href="/reviews"
                  className="text-gray-400 hover:text-violet-400 transition-colors text-sm"
                >
                  리뷰
                </Link>
              </p>
              <div className="w-px h-3 bg-gray-700" />
              <p>
                <Link
                  href="/news"
                  className="text-gray-400 hover:text-violet-400 transition-colors text-sm"
                >
                  기사
                </Link>
              </p>
            </div>
          </div>

          {/* 프로젝트 정보 */}
          <div>
            <h4 className="text-gray-200 font-semibold mb-4">프로젝트 정보</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>제작<span className="ml-2 text-gray-400">2025</span></li>
              <li className="flex items-center gap-2">
                <span>개발</span>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 bg-violet-900/30 text-violet-300 rounded text-xs">
                    wkjo
                  </span>
                  <span className="px-2 py-0.5 bg-pink-900/30 text-pink-300 rounded text-xs">
                    kjg
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 구분선 */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2025 MovieJ. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Made with wkjo & kjg</span>
            </div>
          </div>
        </div>

        {/* 기술 스택 (선택사항) */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <p className="text-xs text-gray-600 text-center">
            Built with Next.js | TypeScript | Tailwind | Spring Boot
          </p>
        </div>
      </div>
    </footer>
  );
}
