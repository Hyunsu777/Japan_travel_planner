# 🗾 Japan Travel Planner

> Claude AI가 생성하는 맞춤형 일본 여행 일정 서비스

일본 여행 지역과 체류 조건에 따라 **Claude AI**가 상세한 여행 일정과 예산을 자동으로 생성해주는 풀스택 웹 서비스입니다.

---

## ✨ 주요 기능

### 필수 입력
- 👥 **관광 인원수** — 성인/어린이 구분 입력
- 📅 **입출국 일시** — 날짜/시간 선택
- 📍 **여행 지역** — 10개 주요 지역 선택 (도쿄, 오사카, 교토 등)

### 선택 입력
- 🏨 **체류일별 호텔명** — 호텔 위치 기반 동선 최적화
- ⚡ **필수 액티비티** — 여러 개 입력 가능, 일정에 우선 배치
- 🍜 **한 끼 식사 최대 비용** — 예산 이하 + Google 평점 4.2 이상 식당만 추천

### AI 생성 결과
- 📋 **일차별 상세 일정** — 시간표, 장소, 소요시간, 팁 포함
- 💰 **총 예산 분석** — 교통비 / 식비 / 액티비티 / 숙박비 분류
- 🎫 **교통 패스 추천** — 지역별 최적 패스 안내
- 💡 **여행 꿀팁** — 현지 실용 정보

---

## 🛠️ 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 18, CSS3 |
| Backend | Node.js, Express |
| AI | Anthropic Claude API (claude-opus-4-5) |
| 통신 | SSE (Server-Sent Events) 스트리밍 |

---

## 🚀 빠른 시작

### 사전 요구사항
- Node.js 18+
- npm 9+
- Anthropic API Key ([발급하기](https://console.anthropic.com))
- GitHub CLI (`gh`) — 자동 레포 생성 시

### 1. GitHub 레포지토리 자동 생성

```bash
# GitHub CLI 설치 (macOS)
brew install gh

# GitHub 로그인
gh auth login

# 레포지토리 생성 & 코드 푸시
chmod +x scripts/setup-github.sh
./scripts/setup-github.sh
```

### 2. 수동 설치

```bash
# 의존성 설치
npm run install:all

# 환경변수 설정
cp backend/.env.example backend/.env
# backend/.env 파일에서 ANTHROPIC_API_KEY 설정

# 개발 서버 실행 (프론트 + 백엔드 동시)
npm run dev
```

### 3. 접속
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

---

## 📁 프로젝트 구조

```
japan-travel-planner/
├── frontend/                    # React 앱
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js               # 메인 앱 & 상태 관리
│   │   ├── index.js
│   │   ├── components/
│   │   │   ├── TravelForm.js    # 입력 폼
│   │   │   ├── LoadingScreen.js # AI 생성 중 화면
│   │   │   └── ItineraryResult.js # 결과 표시
│   │   └── styles/
│   │       └── App.css          # 전체 스타일
│   └── package.json
│
├── backend/                     # Express API
│   ├── src/
│   │   ├── index.js             # 서버 진입점
│   │   ├── routes/
│   │   │   └── itinerary.js     # 일정 생성 라우트
│   │   └── services/
│   │       └── itineraryService.js  # Claude AI 연동
│   ├── .env.example
│   └── package.json
│
├── scripts/
│   └── setup-github.sh          # GitHub 자동 설정
├── .gitignore
├── package.json
└── README.md
```

---

## 🔑 환경 변수

`backend/.env`:

```env
ANTHROPIC_API_KEY=sk-ant-...     # Anthropic API 키 (필수)
PORT=5000                         # 백엔드 포트
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

---

## 📡 API

### `POST /api/itinerary/generate`

SSE(Server-Sent Events) 스트리밍으로 응답합니다.

**Request Body:**
```json
{
  "travelers": { "adults": 2, "children": 1 },
  "arrivalDate": "2024-08-01T10:00",
  "departureDate": "2024-08-05T18:00",
  "region": "도쿄",
  "hotels": [
    { "day": 1, "name": "신주쿠 그랜드 호텔" }
  ],
  "activities": ["디즈니랜드", "팀랩 플래닛"],
  "maxMealBudget": 3000
}
```

**SSE Events:**
```
data: {"type": "chunk", "content": "..."}
data: {"type": "done", "data": { ...itinerary }}
data: {"type": "error", "message": "..."}
```

---

## 🌏 지원 지역

도쿄 · 오사카 · 교토 · 나고야 · 삿포로 · 후쿠오카 · 나라 · 하코네 · 히로시마 · 오키나와

---

## 📝 라이선스

MIT License

---

*Powered by [Claude AI](https://www.anthropic.com) · Built with ❤️*
