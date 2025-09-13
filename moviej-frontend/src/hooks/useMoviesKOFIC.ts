import { useState, useEffect } from "react";

export function useMoviesKOFIC() {
  const [boxOffice, setBoxOffice] = useState<any[]>([]);
  const [movieDetails, setMovieDetails] = useState<Record<string, any>>({});
  const apiKey = process.env.NEXT_PUBLIC_KOFIC_API_KEY;

  // 날짜 계산
  const today = new Date();
  today.setDate(today.getDate() - 1);
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const targetDt = `${yyyy}${mm}${dd}`;

  useEffect(() => {
    console.log("useMoviesKOFIC 렌더링, targetDt:", targetDt, "apiKey:", apiKey);
    // 박스오피스 데이터
    fetch(
      `https://kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${apiKey}&targetDt=${targetDt}`
    )
      .then((res) => {
        console.log("박스오피스 fetch status:", res.status, res.statusText);
        return res.json();
      })
      .then(async (data) => {
        console.log("박스오피스 fetch 결과:", data);
        const list = data.boxOfficeResult?.dailyBoxOfficeList || [];
        setBoxOffice(list);

        // 각 영화의 상세 정보(nationNm 등)도 병렬로 받아오기
        const details: Record<string, any> = {};
        await Promise.all(
          list.map(async (item: any) => {
            try {
              const res = await fetch(
                `https://kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json?key=${apiKey}&movieCd=${item.movieCd}`
              );
              const detailData = await res.json();
              details[item.movieCd] =
                detailData.movieInfoResult?.movieInfo || {};
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
              details[item.movieCd] = {};
            }
          })
        );
        setMovieDetails(details);
      })
      .catch((err) => {
        console.error("박스오피스 fetch 에러:", err);
        setBoxOffice([]);
      });
  }, [apiKey, targetDt]);

  // boxOffice와 movieDetails(movieCd별 상세정보)를 함께 반환
  return { boxOffice, movieDetails };
}