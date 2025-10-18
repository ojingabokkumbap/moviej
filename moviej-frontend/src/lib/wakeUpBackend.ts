/**
 * 백엔드 서버를 깨우는 함수
 * Onrender 무료 플랜은 15분간 트래픽이 없으면 sleep 모드로 들어감
 * 이 함수를 호출하면 백엔드 서버를 미리 깨워둘 수 있음
 */
export async function wakeUpBackend() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl || apiUrl.includes('localhost')) {
    // 로컬 환경에서는 실행하지 않음
    return;
  }

  try {
    // 백엔드 health check 엔드포인트 호출
    // 백엔드에 /health 또는 /api/ping 같은 가벼운 엔드포인트가 있어야 함
    await fetch(`${apiUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5초 타임아웃
    });
    console.log('✅ 백엔드 서버 wake-up 요청 완료');
  } catch (error) {
    // 에러가 나도 괜찮음 (서버가 깨어나는 중일 수 있음)
    console.log('⏳ 백엔드 서버 깨우는 중...');
  }
}
