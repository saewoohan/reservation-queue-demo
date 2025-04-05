# 대기열 시스템 데모

## 소개

이 프로젝트는 실시간 대기열 시스템의 데모 구현입니다. 티켓 예매, 한정판 상품 판매, 온라인 이벤트 참가 등 대규모 사용자가 동시에 접속하는 상황을 관리하기 위한 대기열 시스템을 시연합니다.

## 주요 기능

- **실시간 대기열 관리**: 선착순으로 사용자를 관리하는 대기열 구현
- **SSE(Server-Sent Events)**: 순위 변경을 실시간으로 클라이언트에 전달
- **자동 처리**: 주기적으로 대기열에서 사용자를 처리하는 워커 프로세스
- **상태 알림**: 대기 중/확정 등 상태 변경을 실시간으로 알림

## 기술 스택

### 백엔드
- **NestJS**: 서버 프레임워크
- **Redis**: 대기열 데이터 저장 및 관리 (Sorted Set 활용)
- **Event Emitter**: 서버 내부 이벤트 처리

### 프론트엔드
- **React**: UI 구현
- **TypeScript**: 타입 안전성 확보
- **Tailwind CSS**: 스타일링
- **EventSource API**: 서버와 실시간 통신

## 시스템 아키텍처

1. **사용자 참여**
   - 사용자가 대기열 참가 요청
   - 서버는 타임스탬프 기반으로 대기열(Redis Sorted Set)에 사용자 추가
   - 현재 대기 순위 반환

2. **실시간 업데이트**
   - SSE 연결을 통해 사용자에게 순위 변경 알림
   - 사용자가 처리될 때 확정 알림 전송

3. **처리 프로세스**
   - 백그라운드 워커가 주기적으로 대기열 처리
   - 상위 N명의 사용자를 대기열에서 제거하고 처리 큐로 이동

## 설치 및 실행 방법

### 사전 요구사항
- Node.js (v18 이상)
- Redis 서버

### 백엔드 설정
```bash
# 백엔드 디렉토리로 이동
cd backend

# 의존성 설치
yarn install

# 개발 서버 실행
yarn start:dev
```

### 프론트엔드 설정
```bash
# 프론트엔드 디렉토리로 이동
cd frontend

# 의존성 설치
yarn install

# 개발 서버 실행
yarn dev
```

## 프로젝트 구조

```
reservation-queue-demo/
├── backend/
│   ├── src/
│   │   ├── queue/            # 대기열 관련 모듈
│   │   │   ├── queue.controller.ts  # API 엔드포인트
│   │   │   ├── queue.service.ts     # 비즈니스 로직
│   │   │   └── queue.worker.ts      # 백그라운드 작업
│   │   ├── redis/            # Redis 연결 모듈
│   │   ├── app.module.ts     # 메인 모듈
│   │   └── main.ts           # 앱 진입점
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # 메인 컴포넌트
│   │   └── main.tsx          # 앱 진입점
│   ├── .env                  # 환경 변수
│   └── package.json
│
└── README.md
```