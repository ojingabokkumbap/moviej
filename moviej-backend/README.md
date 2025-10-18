# Moviej-Backend - Spring Boot Application

Moviej 프로젝트의 백엔드 API 서버입니다. Spring Boot + Postgresql + Docker를 사용하여 구축되었습니다.

## 🚀 빠른 시작

### 전체 프로젝트 실행 (백엔드 + DB + 프론트엔드)

```bash
# 모든 서비스 빌드 및 실행
docker-compose up --build

# 백그라운드 실행
docker-compose up --build -d

# 서비스 중지
docker-compose down

# 로그 확인
docker-compose logs app      # 백엔드 로그
docker-compose logs db       # 데이터베이스 로그
docker-compose logs frontend # 프론트엔드 로그

# 컨테이너 상태 확인
docker-compose ps
```

### 개별 서비스 실행

```bash
# 백엔드만 실행 (MySQL은 Docker, Spring Boot는 로컬)
docker-compose up db -d  # MySQL만 실행
./gradlew bootRun        # Spring Boot 로컬 실행

# Gradle 빌드
./gradlew clean build
```

## 📋 서비스 정보

| 서비스 | 포트 | 설명 |
|--------|------|------|
| **백엔드 API** | `8080` | Spring Boot REST API |
| **MySQL DB** | `3307` | MySQL 8.0 데이터베이스 |
| **프론트엔드** | `3000` | React 애플리케이션 |

## 🔧 API 엔드포인트

### 인증
- **ID**: `postman`
- **비밀번호**: `password`
- **인증 방식**: HTTP Basic Authentication

### 주요 엔드포인트
```bash
# POST 목록 조회
GET http://localhost:8080/api/posts

# POST 생성
POST http://localhost:8080/api/posts
Content-Type: application/json

{
  "title": "제목",
  "content": "내용",
  "author": "작성자"
}

# POST 조회
GET http://localhost:8080/api/posts/{id}

# POST 수정
PUT http://localhost:8080/api/posts/{id}

# POST 삭제
DELETE http://localhost:8080/api/posts/{id}
```

### API 테스트 예시

**PowerShell (Windows):**
```powershell
# GET 요청
Invoke-RestMethod -Uri 'http://localhost:8080/api/posts' -Headers @{Authorization='Basic ' + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes('postman:password'))}

# POST 요청
$body = @{
    title = "테스트 제목"
    content = "테스트 내용"
    author = "테스트 작성자"
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:8080/api/posts' -Method POST -Headers @{Authorization='Basic ' + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes('postman:password')); 'Content-Type'='application/json'} -Body $body
```

**curl (Linux/Mac):**
```bash
# GET 요청
curl -u postman:password http://localhost:8080/api/posts

# POST 요청
curl -u postman:password -X POST \
  -H "Content-Type: application/json" \
  -d '{"title":"테스트 제목","content":"테스트 내용","author":"테스트 작성자"}' \
  http://localhost:8080/api/posts
```

## 🗄️ 데이터베이스 접속

### Docker MySQL 컨테이너 직접 접속
```bash
# MySQL 컨테이너 접속
docker exec -it myhealth-backend-db-1 mysql -u user -puserpw mydb

# 테이블 확인
docker exec -it myhealth-backend-db-1 mysql -u user -puserpw mydb -e "SHOW TABLES;"

# 데이터 확인
docker exec -it myhealth-backend-db-1 mysql -u user -puserpw mydb -e "SELECT * FROM posts;"
```

### 외부 도구로 접속
- **호스트**: `localhost`
- **포트**: `3307`
- **데이터베이스**: `mydb`
- **사용자명**: `user`
- **비밀번호**: `userpw`

## 🔧 개발 환경 설정

### 환경변수 설정
Docker Compose를 통해 다음 환경변수들이 자동으로 설정됩니다:

```env
SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/mydb?serverTimezone=Asia/Seoul&useSSL=false&allowPublicKeyRetrieval=true&useUnicode=true&characterEncoding=utf8
SPRING_DATASOURCE_USERNAME=user
SPRING_DATASOURCE_PASSWORD=userpw
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.MySQLDialect
```

### 로컬 개발 시 설정
로컬에서 개발할 때는 `application-local.properties` 파일을 생성하여 사용:

```properties
# application-local.properties
spring.datasource.url=jdbc:mysql://localhost:3307/mydb?serverTimezone=Asia/Seoul&useSSL=false&allowPublicKeyRetrieval=true
spring.datasource.username=user
spring.datasource.password=userpw
```

실행 시:
```bash
./gradlew bootRun --args='--spring.profiles.active=local'
```

## 🚨 문제 해결

### 일반적인 문제들

1. **포트 충돌 (3306 이미 사용 중)**
   - MySQL이 이미 로컬에서 실행 중인 경우
   - 해결: `docker-compose.yml`에서 포트를 다른 포트로 변경 (현재 3307 사용)

2. **MySQL 연결 실패**
   ```bash
   # MySQL 컨테이너 상태 확인
   docker-compose ps
   docker-compose logs db
   
   # MySQL 헬스체크 확인
   docker exec myhealth-backend-db-1 mysqladmin ping -h localhost -u user -puserpw
   ```

3. **Spring Boot 시작 실패**
   ```bash
   # 백엔드 로그 확인
   docker-compose logs app
   
   # 컨테이너 재시작
   docker-compose restart app
   ```

4. **빌드 실패**
   ```bash
   # Gradle 캐시 정리
   ./gradlew clean
   
   # Docker 이미지 재빌드
   docker-compose build --no-cache app
   ```

### 데이터베이스 초기화
```bash
# 데이터베이스 볼륨 삭제 (모든 데이터 삭제됨)
docker-compose down -v
docker-compose up --build
```

## 👥 협업 가이드

### 새로운 팀원 온보딩
1. **저장소 클론**
   ```bash
   git clone [repository-url]
   cd myHealth-backend
   ```

2. **Docker 설치 확인**
   ```bash
   docker --version
   docker-compose --version
   ```

3. **프로젝트 실행**
   ```bash
   docker-compose up --build
   ```

4. **API 테스트**
   - 브라우저에서 `http://localhost:8080/api/posts` 접속
   - Postman 등으로 API 테스트

### 환경 일관성 유지
- 모든 개발자가 동일한 Docker 환경 사용
- `docker-compose.yml` 파일로 일관된 서비스 구성
- 환경변수를 통한 설정 관리

## 🌐 전체 시스템 아키텍처

```
[Frontend (React:3000)] ←→ [Backend (Spring Boot:8080)] ←→ [Database (MySQL:3307)]
```

- **프론트엔드**: React 애플리케이션 (포트 3000)
- **백엔드**: Spring Boot REST API (포트 8080)  
- **데이터베이스**: MySQL 8.0 (포트 3307)

모든 서비스는 Docker 컨테이너로 실행되며, `docker-compose`를 통해 오케스트레이션됩니다.

---

**🎉 성공! 모든 서비스가 정상적으로 실행되고 있습니다.**
