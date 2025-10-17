"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// 임시 뉴스 데이터 (실제로는 API에서 가져올 예정)
const mockNews = [
  {
    id: 1,
    title: "박찬욱의 신작 <어쩔수가없다> 1차 포스터 & 티저 공개, 9월 개봉 소식",
    summary:
      "<헤어질 결심> 이후 선보이는 12번째 장편 영화 〈어쩔수가없다〉가 2025년 9월 개봉을 확정 지으며, 1차 포스터와 티저 예고편을 함께 공개했다. ",
    content: `
      박찬욱 감독이 드디어 2년 만의 신작으로 돌아온다. 
      <헤어질 결심> 이후 선보이는 12번째 장편 영화 〈어쩔수가없다〉가 2025년 9월 개봉을 확정 지으며, 1차 포스터와 티저 예고편을 함께 공개했다. 
      박찬욱 감독이 오랜 시간 기획해왔던 이번 작품은 ‘실직’과 ‘생존’이라는 무거운 현실을 스릴러적 감각으로 풀어낸 블랙코미디 장르로, 박찬욱 감독 특유의 날카로운 시선과 모호함이 집약된 연출로 하반기 가장 기대되는 작품으로 주목받고 있다. 
      원작 소설과 오랜 기획 영화 〈어쩔수가없다〉는 미국 소설가 도널드 E. 웨스트레이크의 작품 <액스(The Ax)>를 원작으로 한다. 원작은 구조조정과 노동시장의 냉혹함을 블랙유머와 서스펜스로 풀어낸 문제작으로, 박 감독은 이 이야기에 매료되어 오랫동안 영화화를 준비해왔다. 
      사실 이 프로젝트는 2017년, 할리우드에서 추진될 예정이었으나 투자 문제로 무산되었다.
      당시 박찬욱 감독은 직접 원작의 한국어판 추천사를 쓰며, 영화 제목을 <모가지>로 하겠다는 의지를 드러낸 바 있다. 이후 <도끼>라는 가제로 알려졌으나, 결국 <어쩔수가없다>로 최종 제목이 확정되었다. 
      감독은 제목 변경의 이유를 “도끼라 하면 관객들이 ‘이번엔 망치가 아니라 도끼로 사람을 죽이나 보다’라고 생각할까봐”라고 유머 있게 밝히기도 했다.
      이번 작품은 박찬욱 감독이 인간의 욕망, 절망, 폭력을 다시금 해부해보려는 시도로 보인다. <헤어질 결심>의 감성적 미장센이 아닌, <올드보이>, <복수는 나의 것> 시절의 서늘함과 치밀함이 돌아올 것이란 예측이 지배적이다. 
    `,
    thumbnail:
      "https://postfiles.pstatic.net/MjAyNTA3MjJfMTY2/MDAxNzUzMTYzODQ5Nzkz.m1-Hr2zaRccL5kQFxBzjayPH1FeOg5wUz-oPzH_t-nkg.enP0gY0M_wjXv4SlLPoVPiCwwk62SIEy7Ve0kG-6rdQg.JPEG/common.jpeg?type=w773",
    category: "개봉 소식",
    publishedAt: "2025-01-15",
    tags: [
      "어쩔수가없다",
      "어쩔수가없다개봉",
      "박찬욱감독",
      "이병헌",
      "손예진",
    ],
  },
  {
    id: 2,
    title:
      "코고나다 감독, 콜린 파렐, 마고 로비의 판타지 로맨스 <빅 볼드 뷰티풀>, 10월 24일 국내 개봉 확정",
    summary:
      "코고나다 감독의 세 번째 장편영화 <빅 볼드 뷰티풀>은 그의 2017년 데뷔작 <콜럼버스>와 2021년작 <애프터 양> 이후 4년 만의 신작이다.",
    content: `
      코고나다 감독의 세 번째 장편영화 <빅 볼드 뷰티풀>은 그의 2017년 데뷔작 <콜럼버스>와 2021년작 <애프터 양> 이후 4년 만의 신작이다. 
      일상적인 풍경 속에서 인간의 내면을 탐구하는 섬세한 연출로 꾸준히 호평 받아온 코고나다 감독은 이번 작품에서 판타지, 로맨스, 드라마, 모험을 아우르는 장르적 실험으로 특유의 철학적 감각을 확장시켰다는 평가를 받고 있다. 
      특히, <애프터 양>의 주연 콜린 파렐과 두 번째 협업으로 어떤 깊이를 만들어낼지 또한 관심이 집중되고 있다. 
      영화는 2025년 10월 24일 국내 개봉이 확정되었으며, 부산국제영화제에도 초청되어 매회 매진 행렬을 이어가고 있다. 
      <빅 볼드 뷰티풀> 줄거리
      환상과 성찰이 담긴 로맨스 로드 무비
      영화는 ‘사라(마고 로비)’와 ‘데이비드(콜린 파렐)’의 여정을 따라가는 로드 무비 형태를 띈다. 
      늘 사랑을 회피해온 사라(마고 로비)와 아직 진정한 사랑을 찾지 못한 데이비드(콜린 파렐), 두 사람은 어느 결혼식에서 처음 만나 신비로운 내비게이션의 안내에 이끌려 특별한 여정을 떠난다. 
      여정 속에서 이들은 마법의 문을 마주하게 되고, 문을 열 때마다 과거를 회상하거나 현실을 직면하기도 하고, 미래의 가능성을 보기도 한다. 
      이렇게 회상 장면과 평행 우주를 교차하는 방식으로 전개되는 <빅 볼드 뷰티풀>은 마법의 문이라는 환상적 장치을 통해 사랑과 관계를 두려워하던 두 인물이 자기 내면을 마주하는 성찰이 담긴 영화이다. 
    `,
    thumbnail:
      "https://postfiles.pstatic.net/MjAyNTA5MjBfMTUy/MDAxNzU4MzgwMTc4NTc3.w5r11bIIw7GV2-O1QrupxtDnDTsq1UzPooOBbpa4NRAg.Tz-yP5iOTFCw9NVq9Io0i-73Oo7y0kwiA35yCtYg0nog.JPEG/%EB%8B%A4%EC%9A%B4%EB%A1%9C%EB%93%9C_(1).jpeg?type=w773",
    category: "개봉 소식",
    publishedAt: "2025-01-12",
    tags: ["빅볼드뷰티폴", "코고나다", "콜린파렐", "마고로비"],
  },
  {
    id: 3,
    title:
      "40년 만에 돌아온 역대 최고의 콘서트 영화 <스탑 메이킹 센스>, 8월 13일 개봉 소식",
    summary:
      "전설이 스크린으로 귀환하다! <스탑 메이킹 센스> 4K 리마스터링 국내 개봉 소식",
    content: `
      보컬과 기타에 데이비드 번, 드럼에 크리스 프란츠, 베이스에 티나 웨이마우스, 기타와 키보드에 제리 해리슨으로 구성된 4인조 밴드 ‘토킹 헤즈’는 1974년 결성 이후 실험적이고 전위적인 음악 스타일로 대중음악사에 굵직한 족적을 남긴 미국의 뉴웨이브 밴드이다. 
      4인조 밴드 '토킹 헤드', 보컬 데이비드 번의 트레이드 마크인 과장된 수트
      해체 이후에도 라디오헤드, R.E.M. 등 수많은 아티스트들에게 영감을 준 ‘토킹 헤즈’는 그야말로 뮤지션들의 뮤지션이라 불린다. 시니컬한 펑크 팝과 아프로비트(구호를 외치는 보컬, 복잡한 교차 리듬, 타악기에 초점을 둔 서아프리카 음악 스타일)를 결합하고, 여기에 다양한 음악적 요소를 더해 실험적인 사운드 세계를 구축한 그들의 음악은 40년이 지난 지금 들어도 여전히 트렌디하다. 
      포스트 펑크와 뉴웨이브를 논할 때 결코 빼놓을 수 없는 밴드 ‘토킹 헤즈’는 제3세계의 음악적 요소를 서구에 적극 도입한 선구자로 평가받는다. 
      그들의 음악적 유산을 더욱 빛나게 하는 또 하나의 특징은 바로 지적인 가사다. 
      날카로운 사회적 시선과 철학적 주제를 담은 가사는 밥 딜런과 어깨를 나란히 한다는 평가를 받는다. 또한 류이치 사카모토, U2와 같은 음악가들과의 협업과 오페라 작곡까지, 그들의 음악적 역량은 다양하고 창의적이이다. 
      아프로펑크의 복잡한 리듬감과 자신들이 구축해 온 뉴욕 펑크의 도회적이고 냉소적인 분위기를 훌륭하게 조화시켰다는 평가를 받는 토킹 헤즈의 음악은 이후 프로그래시브 록, 2000년대 인디 록 장르의 탄생에도 지대한 영향을 미쳤다. 
    `,
    thumbnail:
      "https://postfiles.pstatic.net/MjAyNTA4MDlfMjU3/MDAxNzU0NjY1OTc4Mzgz.YECwPliHmcqIT2VfAwADiG8DOoYsQZkNP3heKcIo8hwg.HLaUcu_qX_ArCBsEtbiI0wd2SlNewvSPgZzwAIa217gg.JPEG/%EB%8B%A4%EC%9A%B4%EB%A1%9C%EB%93%9C_(2).jpeg?type=w773",
    category: "개봉 소식",
    publishedAt: "2025-01-10",
    tags: ["콘서트영화", "펑크팝", "포스트펑크", "스탑메이킹센스", "토킹헤즈"],
  },
  {
    id: 4,
    title:
      "<트론: 아레스> 오프닝 성적 저조... <귀멸의 칼날: 무한성편> 올해 5위 흥행작 등극",
    summary:
      "​토론토 블루제이스와 시애틀 매리너스의 MLB 플레이오프 경기, 그리고 12경기의 NFL 경기로 인해 디즈니의 〈트론: 아레스〉는 이번 주말 극장가에서 다소 주춤하며 3일간 3,350만 달러, 전 세계 6,050만 달러의 데뷔 성적을 기록했습니다.",
    content: `
      이번 주말 전체 북미 박스오피스 규모는 7,200만 달러로, 전년 같은 기간(〈테리파이어 3〉이 1,890만 달러로 깜짝 흥행) 대비 100만 달러 감소했습니다. 컴스코어에 따르면 2025년 가을(노동절 이후~현재) 북미 누적 박스오피스는 7억 7,070만 달러로, 작년과 거의 동일한 수준입니다.
      1. 트론: 아레스 (디즈니) - 4,000개관 / 금 $14.3M / 토 $11M / 일 $8.2M / 3일 $33.5M / 1주차
      2. 루프맨 (파라마운트) - 3,362개관 / 금 $3.2M / 토 $2.8M / 일 $1.9M / 3일 $8M / 1주차
      3. 원 배틀 애프터 어나더 (워너브러더스) - 3,127개관 (-507) / 금 $2M (-41%) / 토 $2.8M / 일 $1.8M / 3일 $6.675M (-39%) / 누적 $54.5M / 3주차
      4. 개비의 인형의 집: 더 무비 (유니버설) - 3,049개관 (-458) / 금 $920K (-25%) / 토 $1.35M / 일 $1.08M / 3일 $3.35M (-37%) / 누적 $26.4M / 3주차
      5. 소울 온 파이어 (소니) - 1,720개관 / 금 $1.3M / 토 $900K / 일 $790K / 3일 $3M / 1주차
      6. 컨저링: 라스트 라이츠 (뉴라인) - 2,334개관 (-419) / 금 $855K (-27%) / 토 $1.3M / 일 $780K / 3일 $2.9M (-29%) / 누적 $172.4M / 6주차
      7. 귀멸의 칼날: 무한성편 (소니) - 1,834개관 (-713) / 금 $585K (-33%) / 토 $930K / 일 $735K / 3일 $2.25M (-36%) / 누적 $128.6M / 5주차
      8. 스매싱 머신 (A24) - 3,321개관 (-24) / 금 $545K (-80%) / 토 $676K / 일 $574K / 3일 $1.79M (-69%) / 누적 $9.7M / 2주차
      9. 스트레인저스: 챕터 2 (라이온스게이트) - 1,878개관 (-812) / 금 $465K (-46%) / 토 $665K / 일 $420K / 3일 $1.55M (-45%) / 누적 $13.4M / 3주차
      10. 굿 보이 (IFC) — 1,650개관 / 금 $418K / 토 $567K / 일 $374K / 3일 $1.36M (-36%) / 누적 $4.8M / 2주차
    `,
    thumbnail:
      "https://postfiles.pstatic.net/MjAyNTEwMTNfMTAx/MDAxNzYwMzQ2MjA3NTU1.lgPsaAWR2GE9CUwbetqN9Gf7qBCcD-r6AR-5R_GfGhgg.cG7YTGkdyg59ISdEajVw80_b4Rd4c5cVflnDpB4PqKEg.JPEG/Tron-Ares-4.jpg?type=w966",
    category: "박스오피스",
    publishedAt: "2025-01-08",
    tags: ["박스오피스", "2025", "한국 영화", "글로벌", "극장"],
  },
  {
    id: 5,
    title: "연상호 감독의 신작 영화 <얼굴>, 9월 11일 개봉 소식",
    summary: "진실이 민낯을 드러냈다. 영화 <얼굴> 9월 개봉 소식",
    content: `
      1100만 돌파라는 신화를 쓴 한국 최초의 좀비 블록버스터 <부산행>, 한국 애니메이션 최초로 칸 국제 영화제 감독 주간에 진출한 <돼지의 왕>, 스페인 히혼 국제 영화제 최우수 애니메이션상을 거머쥔 <사이비>, 작품성과 대중성 모두 인정받은 넷플릭스 드라마 <지옥> 등, 연상호 감독은 대중과 평단을 사로잡은 독특한 디스토피아적 세계관을 가진 감독이다. 
      <부산행>, <지옥>, <돼지의 왕>, <사이비>, 연상호 감독의 독특한 디스토피아적 세계관을 드러내는 작품들
      그의 동명의 그래픽노블을 원작으로 한 이번 작품은 가족을 둘러싼 미스터리 드라마로, 감독의 이전 작품들과는 다른 분위기를 자아낸다고 전해진다. 그러나 그의 작품에서 항상 강조되었던 도덕적 복잡성과 강렬한 에너지는 이번 작품에서도 여전히 드러날 것으로 예상된다. 
      영화 <얼굴>은 총 제작비 2억원대의 저예산 영화로, 촬영 회차에 따른 인건비만 지급하고 중심 배역과 스태프들에게는 지분을 분배해 개봉 이후 수익을 나누어 주는 새로운 방식으로 제작됐다. 
      연상호 감독은 “애초에 접근 방식이 기존과는 다른 영화”라며 “이 작품이 성공한다면 한국 영화계에 새로운 모델이 될 수 있을 것”이라고 말했다. 
      또한, 노 개런티로 출연한 박정민 배우는 작품에 대해 “펀딩 방식이 새로울 뿐 아니라, 마지막까지 가지고 있는 메시지들이 예술적이며 그것이 가장 큰 장점"이라며 감독과 작품에 대한 깊은 애정을 전했다. 
    `,
    thumbnail:
      "https://postfiles.pstatic.net/MjAyNTA4MjZfMTU4/MDAxNzU2MTM0NTUwNjk1.R1aq4CIUGJIYHUSis6-GrQdJZFmQCOzmJuGXaTMDYGkg.RfIT90sdeSX6zRMTvLeIm69Po2jQU7QsLo35bFRvulog.JPEG/SE-6c05f224-ed31-4d42-9212-1f6e7fc132e7.jpg?type=w773",
    category: "개봉 소식",
    publishedAt: "2025-01-05",
    tags: ["얼굴", "연상호감독", "박정민", "권해효"],
  },
  {
    id: 6,
    title: "미리 보는 AI 시대의 영화…완성도는 '글쎄' ('중간계')",
    summary: " AI 기술의 현재와 미래를 보여주는 작품이 관객과 만났다.",
    content: `
      AI가 만든 영상의 정교함이 나날이 높아지고 있다. AI가 만든 가상의 이미지와 현실의 차이가 점점 좁혀지고 있고, AI가 만든 짧은 광고 콘텐츠도 종종 볼 수 있게 됐다. 빠르게 발전하는 AI 분야를 보고 있으면, 영화를 이루는 많은 요소가 이 기술에게 자리를 내어줄 것만 같다는 생각을 하게 된다.
      영화 '중간계'는 AI 기술이 지금 영화 산업에 '어디까지 적용될 수 있는지'를 보여주는 작품이다. 한국 최초의 AI 활용 장편 영화라는 타이틀을 달고 나온 이 작품은 장례식장에서 만난 네 사람이 납치된 상주를 쫓다 교통사고를 당하고, 이승과 저승 사이에 갇히게 되면서 일어나는 이야기를 담았다.
      아쉽게도 '중간계'는 작품이 가진 메시지와 내러티브보다는 기술력에 더 많은 관심이 쏠리고 있다. 현세대 가장 민감한 이슈이자, 산업의 방향과 종사자들이 생계에 큰 영향을 줄 수 있는 AI 기술을 전면에 내세웠다는 점에서 어느 정도 예견된 상황이다. 그리고 실제로 본 '중간계' 역시 기술 시연에만 관심이 있는 듯해 큰 재미를 느끼기 어려웠다.
      AI 이슈를 접어두고, 작품 자체만 본다고 했도 '중간계'는 이야기의 매력이 크지 않다. 우선, 완결성 자체가 부실해 의아함을 자아냈다. AI 기술의 발전 속도를 고려해 1시간 분량의 1편을 먼저 공개한 '중간계'는 이야기가 시작될 법한 시점에 끝이 나 버린다. 많은 요소가 베일에 싸여 있고, 짧은 시간 안에 많은 배우가 나와 전개 자체가 산만했다. 무엇을 말하고자 했는지도 불명확해 작품의 의도를 파악하기도 어려웠다.
      2편을 예고하는 문구로 '중간계'는 큰 덩어리의 일부임을 강조했지만, 시리즈 영화라도 한 편 안에 기승전결은 있어야 했다. '중간계'는 세계관 및 인물을 소개하는 데 대부분의 시간을 쏟다가 무책임하게 퇴장해 버린다. 만들다가 만 것 같은 영화를 본 듯한 느낌에 관객은 불만을 느낄 수밖에 없다. 실제로 상영 후 당혹감을 드러내는 관객을 적지 않게 볼 수 있었다.
    `,
    thumbnail:
      "https://thumbnews.nateimg.co.kr/view610///news.nateimg.co.kr/orgImg/tr/2025/10/17/9c50e380-d997-4588-92f3-a9ad6e61c4de.jpg",
    category: "기술",
    publishedAt: "2025-01-03",
    tags: ["중간계", "AI", "CG"],
  },
  {
    id: 7,
    title:
      "2025년 칸 영화제 황금종려상 자파르 파나히 감독의 <그저 사고였을 뿐>, 전 세계 최초 한국 개봉 소식",
    summary:
      "2025년 칸 황금종려상 수상작 <그저 사고였을 뿐> 전 세계 최초 한국 개봉",
    content: `
    2025년 제78회 칸 영화제 황금종려상을 수상한 자파르 파나히 감독의 신작 <그저 사고였을 뿐>(It Was Just an Accident)이 오는 10월 1일, 전 세계 최초로 한국에서 개봉된다. 이번 개봉은 한국 관객이 세계 최초로 이 작품을 체험할 수 있다는 점에서 의미가 크다. 
    영화는 정비소를 운영하며 평범한 일상을 살아가던 주인공이 과거 임금 체불 문제로 수감된 자신을 고문했던 남자를 우연히 마주하게 되면서 벌어지는 블랙 코미디식 복수극을 그린다. 
    영화의 제목인 ‘It Was Just an Accident’는 ‘그저 사고였을 뿐’으로 의역할 수 있으며, 이는 영화의 발단과 주제를 함축하는 핵심 의미를 담고 있다. 
    이란의 거장, 자파르 파나히 감독
    자신의 수감 시절을 바탕으로 한 이야기
    이번 작품은 자파르 파니히 감독의 수감 시절 경험과 수감자들의 이야기를 바탕으로 만들어졌다. 
    영화 속 주인공들은 각기 다른 방식으로 억압과 불합리한 상황에 맞서고, 임금 체불 문제, 억압적 체제, 시리아 내전 개입 등 현 이란 정권에 대한 날카로운 비판이 곳곳에 녹아 있어, 작품 자체가 정치적·사회적 발언이라해도 과언이 아니다. 
    파나히 감독은 이란 정부의 반체제 인사로, 이번 작품 역시 정부의 허가없이 비밀리에 영화를 제작하고 칸 영화제에 출품했다. 그의 노력은 만장일치 찬사와 최고의 평점으로 이어졌고, 결국 황금종려상을 거머쥐었다. 

    그의 수상은 단순한 영화제 수상이 아니라, 현 이란 정권의 인권 탄압과 표현의 자유 제한에 대한 국제적 메시지로 해석된다. 
    베니스 황금사자상 수상작 <써클>(2000년), 베를린 황금곰상 수상작 <택시>(2015년)
    또한, 파나히 감독은 베니스국제영화제 황금사자상(2000년)과 베를린국제영화제 황금곰상(2015년), 칸영화제 황금종려상(2025년)으로 세계 3대 영화제 최고상 석권이라는 '트리플 크라운' 기록을 달성했다. 이 기록은 전 세계 감독 중 네 번째에 해당하며, 현존하는 감독 중에는 유일한 기록 보유자이기도 하다. 
    `,
    thumbnail:
      "https://postfiles.pstatic.net/MjAyNTA4MjdfMjMw/MDAxNzU2MjI2MzYxMDYz.5lGn1z-vODOXTs1IVlu9XzrqhQVMgF0-ECBYd2XyZVQg.8LalEgpxGna1k_XUpAsunCJ-szHZZeYEXMHFacrUodUg.JPEG/common.jpeg?type=w773",
    category: "개봉 소식",
    publishedAt: "2024-12-31",
    tags: ["그저사고였을뿐", "자파르파나히"],
  },
  {
    id: 8,
    title: "영화와 TV 프로그램의 언어 더빙을 완전히 바꿔놓을 인공지능 기술",
    summary:
      "스웨덴 영화 'Watch the Skies'는 인공지능을 활용해 영어로 더빙이 입혀졌다",
    content: `
      미국 시장에 어필이 될 만한 국제 영화를 발굴하는 것은 XYZ 필름스의 중요한 업무 중 하나다.
      맥심 코트레는 미국 로스앤젤레스에 본사를 둔 이 독립 스튜디오의 최고운영책임자다.
      그는 미국 시장은 영어가 아닌 외국어로 된 영화에 있어 항상 까다로운 곳이었다고 말한다.
      "지금까지는 뉴욕 해안가의 관객층을 대상으로 하는 아트하우스 영화에 한정돼 왔습니다."
      이는 부분적으로 언어 문제 때문이다.
      그는 "미국은 유럽처럼 자막이나 더빙 문화 속에서 성장한 사회가 아닙니다."라고 지적한다.
      하지만 이런 언어 장벽은 새로운 AI 기반 더빙 시스템을 통해 더 쉽게 극복할 수 있을지도 모른다.
      최근 스웨덴 공상과학영화 'Watch the Skies'의 음성과 영상이 '딥 에디터'라는 디지털 도구에 입력됐다.
      이 소프트웨어는 영상을 조작해 배우들이 마치 그 언어를 실제로 말하는 것처럼 보이게 만든다.
      코트레는 "2년 전 이 기술의 결과물을 처음 봤을 땐 그냥 괜찮다는 수준이었지만, 최근 편집본을 보고는 정말 놀라웠다"며 "일반 관객이 본다면 눈치채지 못할 것이다. 그냥 배우들이 그 언어를 원래 말한다고 생각할 수준"이라고 말했다.
      영어 버전의 'Watch the Skies'는 지난 5월 미국 전역 110개 AMC 극장에서 개봉했다.
      코트레는 "만약 이 영화가 영어로 더빙되지 않았다면, 미국 극장 개봉은 애초에 불가능했을 것"이라고 설명했다.
      "덕분에 미국 관객들은 원래라면 소수 관객만 볼 수 있었을 스웨덴 독립영화를 접할 수 있었습니다."
그는 AMC가 앞으로도 이와 같은 개봉 방식을 더 이어갈 계획이라고 밝혔다.
    `,
    thumbnail:
      "https://ichef.bbci.co.uk/ace/ws/800/cpsprodpb/c6a2/live/70ddd0a0-62f5-11f0-83d2-4f671b8c1523.png.webp",
    category: "기술",
    publishedAt: "2024-12-28",
    tags: ["기술", "비즈니스", "인공지능 AI"],
  },
  {
    id: 9,
    title: "올 추석, 웃기는 놈이 보스다!",
    summary:
      "올 추석, 온 가족이 함께 즐길 수 있는 제대로 된 코미디가 찾아온다!",
    content: `
    영화 <보스>는 조직의 미래를 책임질 차기 넘버원의 자리를 두고 조직 내에서 평판이나 입지가 모두 단단한 이인자들이 자신의 꿈을 위해 일인자의 자리를 거부하면서 벌어지는 이야기를 그린 액션 코미디입니다. 
    밑바닥 시절부터 함께 한 순태, 강표, 판호는 보스를 모시며 빠르게 지역구 최고의 조직으로 거듭나는데요. 단순히 주먹을 쓰는 조직에서 머무는 것이 아니라 더 큰 꿈을 꿨던 이들은 가족이 되어 기업을 이룹니다.
    그렇게 모든 것이 순탄할 줄 알았으나 시대가 흐르고 조직에 대한 세상의 시선이 달라지면서 더는 예전과 같은 룰이 통하지 않게 되는데요. 이들이 힘들게 세운 기업은 점차 기울기 시작하고 조직을 이끌었던 보스까지 갑작스러운 죽음을 맞이합니다. 
    보스의 죽음은 오랫동안 그를 따라다녔던 조직원들에게 큰 충격으로 다가오지만 흔들리는 조직을 바로 세우기 위해서는 냉정함을 유지하고 빠르게 차기 일인자를 뽑아야 하는데요.
    조직의 중추들은 모두 한 마음 한뜻으로 순태를 차기 보스로 적극 지지합니다. 
    문제는 순태가 그 자리를 원하지 않는다는 것인데요. 조직의 원년 멤버이지만 중식당 미미루를 운영하며 주먹보다는 손맛으로 가족들의 생계를 책임지는 미래를 그리고 있었던 것이죠.  
    여기에 순태처럼 조직 내 입지는 단단하지만 마찬가지로 탱고라는 인생의 새로운 꿈을 찾은 강표와 세 사람 중 유일하게 보스 자리에 진심이지만 사람들의 마음을 얻지 못한 판호가 가세해 보스 양보 전쟁을 벌이게 됩니다.
    `,
    thumbnail:
      "https://postfiles.pstatic.net/MjAyNTA5MjRfOCAg/MDAxNzU4NzAzNTkwODE5.NJomyxwpBFysCBYPq4a_KOmEBw2zDucyANt4eAPHF10g.4J0Sd3L8oIwxuwpPqJaKeIROUfaLHpilwseqekqq_xkg.JPEG/common_(4).jpeg?type=w773",
    category: "개봉 소식",
    publishedAt: "2024-12-28",
    tags: ["개봉소식", "보스"],
  },
  {
    id: 10,
    title: "일본 애니 초강세…‘주술회전’·‘체인소맨’ 나란히 1·2위[MK박스오피스]",
    summary:
      "‘극장판 주술회전: 회옥·옥절’이 개봉 날 박스오피스 왕좌에 오르며 일본 애니메이션의 강세를 이어 갔다.",
    content: `
    17일 영화진흥위원회 영화관 입장권 통합전산망 집계에 따르면 ‘극장판 주술회전: 회옥·옥절’(이하 극장판 주술회전‘)은 전날 3만2355명 관객을 동원하며 전체 박스오피스 1위를 기록했다.

    기존 1위였던 ‘극장판 체인소 맨: 레제편’과 한국 영화 ‘보스’, ‘어쩔수가없다’를 단 번에 제치며 무서운 기세로 등장했다. CGV 골든 에그지수 96%, 메가박스 9.1점, 롯데시네마 9.3점 등 극장 3사에서 높은 실관람 평점을 기록하며 관객들의 호평이 쏟아지고 있다.

    ‘극장판 체인소 맨: 레제편’는 2위로 밀려났다. 같은 날 2만 8천여명을 동원해 누적 관객수는 196만 9천여명이다.

    영화는 전 세계 누계 발행 부수 3000만 부를 돌파한 후지모토 타츠키의 만화 ‘체인소 맨’의 인기 에피소드 레제편을 영화화한 작품으로 200만 고지 돌파를 앞뒀다.

    3위는 ‘보스’(감독 라희찬)다. 2만 2천여명을 동원, 누적 관객수는 213만 9천여명이다. 4위는 ‘어쩔수가없다’(감독 박찬욱)로 1만 5천여명의 관객을 끌어 모아 누적 관객수는 269만 8천여명을 기록 중이다.

    이날 오전 11시 기준 예매율 1위는 ‘극장판 체인소 맨:레제편’(25.9%)이다. 뒤를 이어 ‘퍼스트 라이드’(9.5%) ‘극장판 주술회전: 회옥 옥절’(8.6%) 순이다.
    `,
    thumbnail:
      "https://pimg.mk.co.kr/news/cms/202510/17/news-p.v1.20251017.b42966691d7e44b086374cac7a55c302_P1.jpeg",
    category: "박스오피스",
    publishedAt: "2024-12-28",
    tags: ["주술회전", "박스오피스", "일본 애니메이션"],
  },
  {
    id: 11,
    title: "'AI기술과 영화의 만남' 8∼10일 제주AI국제필름페스티벌",
    summary:
      "인공지능(AI)을 활용해 만든 세계 각국의 영화를 만나볼 수 있는 행사가 제주에서 열린다.",
    content: `
    4일 제주도에 따르면 제주도가 주최하고 제주콘텐츠진흥원이 주관하는 2025 제주AI국제필름페스티벌(www.jjaiff.kr)이 8∼10일 3일간 제주문예회관과 비인(BeIN;) 공연장에서 펼쳐진다.

    영화제 공모에는 전 세계 95개국에서 1천210편이 출품됐고, 3차 심사를 거쳐 최종 18편이 선정됐다.

    대상은 프랑스 엘리엇 우를리에(Eliott HOURLIER) 감독의 'Evolution(에볼루션)'이 차지했다. 인류의 확장으로 파괴된 자연에서 오락거리로 전락한 사이버네틱 동물 왕국 속에서 새끼를 보호하려는 어미 고릴라의 고향으로의 여정을 담은 작품이다.

    제주의 전통 품앗이 문화인 수눌음 공동체 정신을 다룬 '렛츠 수눌음'은 픽션 부문 최우수상, 제주도민 제작진이 해녀 어머니 이야기로 만든 'COZI(코지)'가 논픽션 부문 장려상을 각각 받았다.

    8일 제주 AI 아나운서 '제이나'의 진행으로 열리는 개막식에서는 대상작을 비롯해 제주 신화를 소재로 한 '바람, 꿈'(한국예술종합학교 A&T랩)과 AI 로봇 포포의 휴머니즘을 그린 'I'm PoPo'(김일동 미디어아트 작가)가 초청 상영된다.

    9일에는 공모전 시상식, AI&ART 포럼, 기업특강 및 초청작·수상작 상영, 기술과 예술의 대화 등이 마련됐다.

    AI&ART 포럼 1부에서는 '기술(術);예술(術). 공존의 術'을 주제로 이준호 제주도 정책자문위원이 좌장을 맡고 오영훈 제주지사, 김대식 KAIST 교수, 양윤호 영화진흥위원회 부위원장, 양은희 제주도립김창열미술관장, 이태리 한국영화감독협회 부이사장이 토론한다.

    2부에서는 제주도와 유네스코 동아시아지역사무소가 브라질, 몽골, 콜롬비아 등 11개국에서 진행한 '제주문화 글로벌 AI 아트 클래스' 교육 성과가 공유된다.

    아울러 어도비의 '생성형 AI, 파이어플라이를 활용한 콘텐츠 저작 도구의 변화', 구글클라우드의 'AI 솔루션 및 활용사례' 특강도 열린다.

    마지막 날인 10일 오후에는 KBS제주 AI제작연구회에서 제작한 AI 영화 '잊혀진 제주마, 영웅 레클리스'가 특별상영된다.

행사 기간 비인 공연장 로비에서는 한국 어도비의 파이어플라이 체험 부스와 구글클라우드의 최신 제미나이가 탑재된 AI로봇, KT제주단의 케이터링 로봇, SW미래채움제주센터의 AI로봇축구와 AI오목로봇 등을 체험할 수 있다.
    `,
    thumbnail:
      "https://cdn.thedailypost.kr/news/photo/201903/67108_60085_5220.png",
    category: "기술",
    publishedAt: "2024-12-28",
    tags: ["기술", "제주", "제주AI국제필름페스티벌"],
  },
  {
    id: 12,
    title: "한국 코미디 vs 일본 애니메이션…박스오피스 ‘접전’",
    summary:
      "추석 연휴를 맞아 극장가가 활기를 띠는 가운데, 코미디 영화 ‘보스’가 새롭게 박스오피스 1위에 올랐다.",
    content: `
    추석 연휴를 맞아 극장가가 활기를 띠는 가운데, 코미디 영화 ‘보스’가 새롭게 박스오피스 1위에 올랐다. 영화진흥위원회 통합전산망에 따르면 지난 3일 개봉한 ‘보스’는 6일까지 누적 관객 98만 명을 기록하며 연휴 초반 흥행을 주도하고 있다.

    조직의 보스 자리를 두고 벌어지는 소동을 그린 ‘보스’는 조우진, 정경호, 이규형 등이 주연을 맡은 코미디 영화다. 98분의 부담 없는 상영 시간으로 명절 기간 가족 단위 관객을 공략하고 있다. 지난 6일 하루에만 31만 명을 동원하며 확고한 1위 추석 영화로 등극했다.

    기존 박스오피스 1위였던 박찬욱 감독의 ‘어쩔수가없다’는 2위로 한 계단 내려왔지만, 누적 관객 172만 명을 동원하며 꾸준한 인기를 과시하고 있다. 연휴 기간 중 200만 관객 돌파가 유력시된다.

    일본 애니메이션의 강세도 두드러진다. ‘극장판 체인소 맨: 레제편’은 5일 오전 누적 관객 100만 명을 돌파하며 박스오피스 3위에 올랐다. 화려한 액션과 입문자도 쉽게 즐길 수 있는 스토리로 관객들에게 좋은 반응을 얻고 있다.

    4위 ‘극장판 귀멸의 칼날: 무한성편’은 장기 흥행을 이어가며 누적 관객 515만 명을 기록, 역대 국내 개봉 일본 애니메이션 흥행 1위인 ‘스즈메의 문단속’(558만 명)의 기록을 넘보고 있다.

    한편, 폴 토머스 앤더슨 감독과 레오나르도 디카프리오가 호흡을 맞춘 ‘원 배틀 애프터 어나더’는 누적 관객 10만 명으로 5위를 차지했다. 이 작품은 이미 국내에서 개봉한 폴 토머스 앤더슨 감독의 연출작 중 최고 흥행 기록을 경신했다.

    이처럼 이번 추석 극장가는 신작 코미디와 기존 흥행작, 그리고 강력한 팬덤을 기반으로 한 일본 애니메이션들이 치열한 경쟁을 벌이며 관객들의 발길을 끌고 있다.
    `,
    thumbnail:
      "https://img4.daumcdn.net/thumb/R658x0.q70/?fname=https://t1.daumcdn.net/news/202510/04/kbs/20251004111451438jzfx.jpg",
    category: "박스오피스",
    publishedAt: "2024-12-28",
    tags: ["박스오피스", "한국", "일본애니메이션"],
  },
];

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);

  useEffect(() => {
    const id = parseInt(params.id as string);
    const foundArticle = mockNews.find((news) => news.id === id);
    if (foundArticle) {
      setArticle(foundArticle);
      // 기사 제목으로 페이지 타이틀 설정
      document.title = `${foundArticle.title} - MovieJ`;
    }
  }, [params.id]);

  if (!article) {
    return (
      <main className="min-h-screen bg-gray-900 text-white pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl text-gray-400">뉴스를 찾을 수 없습니다</h1>
            <Link
              href="/news"
              className="text-violet-400 hover:text-violet-300 mt-4 inline-block"
            >
              뉴스 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          뒤로가기
        </button>

        {/* 기사 헤더 */}
        <header className="mb-8">
          {/* 카테고리 */}
          <div className="mb-4">
            <span className="bg-violet-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {article.category}
            </span>
          </div>

          {/* 제목 */}
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            {article.title}
          </h1>

          {/* 요약 */}
          <p className="text-xl text-gray-300 mb-6 leading-relaxed">
            {article.summary}
          </p>

          {/* 메타 정보 */}
          <div className="flex items-center justify-between text-sm text-gray-400 border-b border-gray-700 pb-6">
            <div className="flex items-center space-x-6">
              <span>
                {new Date(article.publishedAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </header>

        {/* 썸네일 이미지 */}
        <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
          <Image
            src={article.thumbnail}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>

        {/* 본문 내용 */}
        <article className="prose prose-invert prose-lg max-w-none mb-12">
          <div
            dangerouslySetInnerHTML={{ __html: article.content }}
            className="text-gray-300 leading-relaxed break-words whitespace-pre-line"
          />
        </article>

        {/* 태그 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-3">태그</h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag: string) => (
              <span
                key={tag}
                className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-gray-700 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* 관련 뉴스 */}
        <section className="border-t border-gray-700 pt-8 mt-12">
          <h3 className="text-2xl font-bold text-white mb-6">관련 뉴스</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockNews
              .filter(
                (news) =>
                  Number(news.id) !== Number(article.id) &&
                  news.category === article.category
              )
              .slice(0, 2)
              .map((relatedNews) => (
                <Link
                  key={relatedNews.id}
                  href={`/news/${relatedNews.id}`}
                  className="group"
                >
                  <article className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors">
                    <div className="relative h-32 overflow-hidden">
                      <Image
                        src={relatedNews.thumbnail}
                        alt={relatedNews.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-violet-400 transition-colors min-h-12">
                        {relatedNews.title}
                      </h4>
                      <p className="text-gray-400 text-sm line-clamp-2 min-h-10">
                        {relatedNews.summary}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}
