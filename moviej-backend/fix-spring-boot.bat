@echo off
echo "Spring Boot 연결 문제 해결 스크립트"
echo "================================="

echo "1. 기존 컨테이너 정리..."
docker-compose down

echo "2. 네트워크 및 볼륨 정리..."
docker-compose down -v
docker network prune -f

echo "3. 이미지 재빌드..."
docker-compose build --no-cache

echo "4. 서비스 시작..."
docker-compose up -d

echo "5. 컨테이너 상태 확인..."
timeout /t 10
docker-compose ps

echo "6. 백엔드 로그 확인..."
docker-compose logs app

pause
