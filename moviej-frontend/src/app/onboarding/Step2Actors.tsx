"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

interface Actor {
  id: number | string; // TMDB ID 또는 임시 문자열 ID
  name: string;
  profilePath: string | null;
  knownFor: string;
}

interface Step2ActorsProps {
  onNext: () => void;
  onPrev: () => void;
  onDataUpdate: (data: any) => void;
  data: any;
}

const DOMESTIC_ACTORS = [
  "송강호",
  "마동석",
  "공유",
  "이병헌",
  "최민식",
  "설경구",
  "황정민",
  "조인성",
  "이정재",
  "박해일",
  "김윤석",
  "엄지원",
  "전지현",
  "김태리",
  "김고은",
  "박소담",
  "박정민",
  "전도연",
  "손예진",
  "이나영",
  "김희애",
  "문소리",
  "김민희",
  "조여정",
  "신민아",
  "류승범",
  "최우식",
  "이선균",
  "김다미",
  "박은빈",
  "한지민",
  "공효진",
  "진선규",
  "정우성",
  "하정우",
  "류준열",
  "박소담",
  "박서준",
  "윤계상",
  "염정아",
  "차태현",
  "배두나",
  "이성민",
  "박보검",
  "송중기",
  "강동원",
  "이하늬",
  "유해진",
  "류승룡",
  "김해숙",
];

// 해외 인기 배우 리스트
const INTERNATIONAL_ACTORS = [
  "Tom Cruise",
  "Leonardo DiCaprio",
  "Brad Pitt",
  "Johnny Depp",
  "Robert Downey Jr.",
  "Chris Evans",
  "Chris Hemsworth",
  "Anne Hathaway",
  "Natalie Portman",
  "Chris Pratt",
  "Tom Holland",
  "Benedict Cumberbatch",
  "Rachel McAdams",
  "Hugh Jackman",
  "Ryan Reynolds",
  "Ryan Gosling",
  "Jake Gyllenhaal",
  "Matt Damon",
  "Ben Affleck",
  "Penélope Cruz",
  "George Clooney",
  "Keanu Reeves",
  "Kristen Stewart",
  "Will Smith",
  "Morgan Freeman",
  "Samuel L. Jackson",
  "Al Pacino",
  "Robert De Niro",
  "Christian Bale",
  "Jennifer Lawrence",
  "Mark Ruffalo",
  "Michael Fassbender",
  "Jeremy Renner",
  "Jason Momoa",
  "Vin Diesel",
  "Dwayne Johnson",
  "Sylvester Stallone",
  "Angelina Jolie",
  "Arnold Schwarzenegger",
  "Jack Nicholson",
  "Tom Hanks",
  "Cate Blanchett",
  "Jamie Foxx",
  "Daniel Craig",
  "Jude Law",
  "Gerard Butler",
  "Colin Farrell",
  "Sean Penn",
  "Javier Bardem",
  "Scarlett Johansson",
];

// TMDB에서 배우 정보를 검색하는 함수
async function searchActorOnTMDB(actorName: string): Promise<Actor> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    if (!apiKey) {
      console.warn("TMDB API key not found");
      // API 키가 없을 때는 기본 정보만 반환
      return {
        id: `local_${actorName}`, // 배우 이름 기반 ID
        name: actorName,
        profilePath: null,
        knownFor: "배우",
      };
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&language=ko-KR&query=${encodeURIComponent(
        actorName
      )}`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const actor = data.results[0];

      // 대표작 정보 (known_for)
      let knownFor = "배우";
      if (actor.known_for && actor.known_for.length > 0) {
        const movies = actor.known_for
          .filter((item: any) => item.media_type === "movie")
          .map((movie: any) => movie.title || movie.name)
          .slice(0, 2);
        if (movies.length > 0) {
          knownFor = movies.join(", ");
        }
      }

      return {
        id: actor.id,
        name: actor.name || actorName,
        profilePath: actor.profile_path
          ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
          : null,
        knownFor,
      };
    }

    // 검색 결과가 없을 때는 기본 정보 반환
    return {
      id: `local_${actorName}`, // 배우 이름 기반 ID
      name: actorName,
      profilePath: null,
      knownFor: "배우",
    };
  } catch (error) {
    console.error(`Error searching for actor ${actorName}:`, error);
    // 에러 발생시에도 기본 정보 반환
    return {
      id: `local_${actorName}`, // 배우 이름 기반 ID
      name: actorName,
      profilePath: null,
      knownFor: "배우",
    };
  }
}

export default function Step2Actors({
  onNext,
  onPrev,
  onDataUpdate,
  data,
}: Step2ActorsProps) {
  const [selectedActors, setSelectedActors] = useState<Actor[]>(
    data.actors || []
  );
  const [actors, setActors] = useState<Actor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"domestic" | "international">(
    "domestic"
  );

  // 컴포넌트 마운트시 배우 정보 로드
  useEffect(() => {
    loadActors();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadActors = async () => {
    setIsLoading(true);
    setError(null);
    setActors([]); // 이전 목록 초기화

    try {
      const actorList =
        activeTab === "domestic" ? DOMESTIC_ACTORS : INTERNATIONAL_ACTORS;

      // 배우를 청크 단위로 나누어 점진적으로 로드
      const chunkSize = 10;
      const chunks = [];
      for (let i = 0; i < actorList.length; i += chunkSize) {
        chunks.push(actorList.slice(i, i + chunkSize));
      }

      const allActors: Actor[] = [];

      for (const chunk of chunks) {
        const chunkPromises = chunk.map((name) => searchActorOnTMDB(name));
        const chunkResults = await Promise.all(chunkPromises);
        allActors.push(...chunkResults);

        // 청크마다 결과를 점진적으로 업데이트
        setActors([...allActors]);

        // 다음 청크 로드 전 짧은 지연
        if (allActors.length < actorList.length) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }
    } catch (err) {
      setError("배우 정보를 불러오는데 실패했습니다.");
      console.error("Error loading actors:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActorToggle = (actor: Actor) => {
    const isSelected = selectedActors.some((a) => a.id === actor.id);
    const updated = isSelected
      ? selectedActors.filter((a) => a.id !== actor.id)
      : [...selectedActors, actor];
    setSelectedActors(updated);
    onDataUpdate({ actors: updated });
  };

  const canProceed = selectedActors.length >= 10;

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">좋아하는 배우를 선택해주세요</h2>
      <p className="mb-8">
        최소 10명 이상 선택해주세요!
        <span className="font-medium">({selectedActors.length}/10)</span>
      </p>
      {/* 탭 메뉴 */}
      <div className="mb-6">
        <div className="flex justify-center">
          <div className="flex  p-1">
            <button
              onClick={() => setActiveTab("domestic")}
              className={`px-6 py-2 rounded-full transition-colors font-medium ${
                activeTab === "domestic"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              국내
            </button>
            <button
              onClick={() => setActiveTab("international")}
              className={`px-6 py-2 rounded-full transition-colors font-medium ${
                activeTab === "international"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              해외
            </button>
          </div>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {/* 배우 목록 */}
      {actors.length > 0 && (
        <div className="mb-8">
          <div className="h-full">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {actors.map((actor, index) => {
                // index 추가
                const isSelected = selectedActors.some(
                  (a) => a.id === actor.id
                );
                return (
                  <button
                    key={`${actor.id}_${index}`} // 고유한 키로 변경
                    onClick={() => handleActorToggle(actor)}
                    className={`
                p-3 rounded-lg border-[1px] transition-all duration-200 hover:scale-105
                ${
                  isSelected
                    ? "border-violet-500"
                    : "border-gray-500 hover:border-violet-400 "
                }
              `}
                  >
                    <svg width="20" height="20" viewBox="0 0 12 12" fill="none">
                      <circle
                        cx="6"
                        cy="6"
                        r="6"
                        fill={isSelected ? "#5b21b6" : "#9ca3af"} // isSelected 사용
                      />
                      <path
                        d="M4 6.5L6 8.5L8 4.5"
                        stroke="#fff"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {actor.profilePath ? (
                      <Image
                        src={actor.profilePath}
                        alt={actor.name}
                        width={70}
                        height={75}
                        className="mx-auto mb-2 rounded-full object-contain h-30"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-2 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">사진없음</span>
                      </div>
                    )}

                    <div className="font-medium text-base text-gray-200">
                      {actor.name}
                    </div>
                    {actor.knownFor && actor.knownFor !== "배우" && (
                      <div className="text-xs text-gray-300 truncate">
                        {actor.knownFor}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 배우 로드 실패시 */}
      {!isLoading && actors.length === 0 && (
        <div className="mb-8 text-center text-gray-500">
          배우 정보를 불러올 수 없습니다. 새로고침을 시도해주세요.
        </div>
      )}

      {/* 선택된 배우 목록 */}
      {selectedActors.length > 0 && (
        <div className="mb-8 h-28">
          <div className="flex flex-wrap gap-2 justify-center">
            {selectedActors.map((actor) => (
              <span
                key={actor.id}
                className="px-3 py-1 rounded-sm text-base font-light flex items-center gap-1 border-violet-500 border"
              >
                <button
                  onClick={() => handleActorToggle(actor)}
                  className="text-gray-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="icon icon-tabler icons-tabler-outline icon-tabler-x"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M18 6l-12 12" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
                {actor.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          onClick={onPrev}
          className="text-lg flex items-center justify-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-left"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M15 6l-6 6l6 6" />
          </svg>
          이전 단계
        </button>

        <div className="flex justify-end items-center">
          <div className="text-right">
            {selectedActors.length < 10 && (
              <span className="text-purple-400 text-lg flex items-center justify-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="icon icon-tabler icons-tabler-filled icon-tabler-alert-circle"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M12 2c5.523 0 10 4.477 10 10a10 10 0 0 1 -19.995 .324l-.005 -.324l.004 -.28c.148 -5.393 4.566 -9.72 9.996 -9.72zm.01 13l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -8a1 1 0 0 0 -.993 .883l-.007 .117v4l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-4l-.007 -.117a1 1 0 0 0 -.993 -.883z" />
                </svg>
                배우를 10명 이상 선택해주세요.
              </span>
            )}
          </div>
          {canProceed && (
            <button onClick={onNext} className="text-lg flex items-center ">
              다음 단계
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-right"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M9 6l6 6l-6 6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
