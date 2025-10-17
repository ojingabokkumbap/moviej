import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MovieJ - 영화 추천 플랫폼",
  description: "AI 기반 개인화 영화 추천 서비스",
};

export default function Home() {
  redirect("/home");
  return null;
}