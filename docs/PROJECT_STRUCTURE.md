# Project Structure

InterviewMate 프로젝트 폴더 구조 설계

---

## 1. Frontend Directory Tree

```
frontend/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── env.d.ts
├── .env
├── .env.development
├── .env.production
│
├── public/
│   └── favicon.ico
│
└── src/
    ├── main.ts                          # 앱 엔트리 포인트
    │
    ├── app/                             # 앱 초기화 및 전역 설정
    │   ├── App.vue                      # 루트 컴포넌트
    │   ├── router/
    │   │   ├── index.ts                 # Vue Router 인스턴스
    │   │   └── guards.ts               # 네비게이션 가드 (인증 체크)
    │   ├── plugins/
    │   │   ├── element-plus.ts          # Element Plus 설정
    │   │   └── pinia.ts                 # Pinia 설정
    │   └── styles/
    │       ├── variables.scss           # 전역 SCSS 변수
    │       └── global.scss              # 전역 스타일
    │
    ├── shared/                          # 공통 모듈
    │   ├── api/
    │   │   ├── client.ts                # Axios 인스턴스, 인터셉터
    │   │   └── types.ts                 # 공통 API 응답 타입 (ApiResponse, PaginatedResponse, ApiError)
    │   ├── types/
    │   │   └── index.ts                 # 공통 타입 (Pagination, SortOrder 등)
    │   ├── utils/
    │   │   ├── date.ts                  # 날짜 포맷 유틸
    │   │   ├── file.ts                  # 파일 관련 유틸 (크기 포맷, 확장자 검증)
    │   │   └── validation.ts            # 공통 유효성 검증
    │   ├── composables/
    │   │   ├── use-loading.ts           # 로딩 상태 관리
    │   │   └── use-pagination.ts        # 페이지네이션 로직
    │   ├── ui/
    │   │   ├── AppHeader.vue            # 공통 헤더
    │   │   ├── AppLayout.vue            # 공통 레이아웃
    │   │   └── EmptyState.vue           # 빈 상태 컴포넌트
    │   └── constants/
    │       └── index.ts                 # 상수 (API_BASE_URL, 파일 크기 제한 등)
    │
    ├── features/                        # 도메인별 Feature 모듈
    │   │
    │   ├── auth/
    │   │   ├── api/
    │   │   │   └── auth.api.ts          # 회원가입, 로그인 API 호출
    │   │   ├── model/
    │   │   │   ├── auth.types.ts        # User, LoginRequest, SignupRequest 등
    │   │   │   └── auth.store.ts        # 인증 상태 관리 (토큰, 유저 정보)
    │   │   ├── ui/
    │   │   │   ├── LoginForm.vue        # 로그인 폼
    │   │   │   └── SignupForm.vue       # 회원가입 폼
    │   │   └── index.ts                 # public API
    │   │
    │   ├── resume/
    │   │   ├── api/
    │   │   │   └── resume.api.ts        # PDF 업로드, 분석 요청, 이력서 조회 API
    │   │   ├── model/
    │   │   │   ├── resume.types.ts      # Resume, Career, Project, AnalysisStatus 등
    │   │   │   └── resume.store.ts      # 이력서 상태 관리
    │   │   ├── ui/
    │   │   │   ├── ResumeUploader.vue   # PDF 업로드 컴포넌트
    │   │   │   ├── ResumeAnalysis.vue   # 분석 결과 표시
    │   │   │   ├── SkillTagList.vue     # 기술 스택 태그 목록
    │   │   │   └── ResumeDetail.vue     # 이력서 상세 (경력, 프로젝트)
    │   │   └── index.ts
    │   │
    │   ├── question/
    │   │   ├── api/
    │   │   │   └── question.api.ts      # 질문 생성, 질문 세트 조회, 꼬리 질문 API
    │   │   ├── model/
    │   │   │   ├── question.types.ts    # QuestionSet, Question, QuestionType, FollowUp 등
    │   │   │   └── question.store.ts    # 질문 세트 상태 관리
    │   │   ├── ui/
    │   │   │   ├── QuestionGenerator.vue    # 질문 생성 설정 (난이도, 개수)
    │   │   │   ├── QuestionSetPreview.vue   # 질문 세트 미리보기
    │   │   │   └── QuestionCard.vue         # 개별 질문 카드
    │   │   └── index.ts
    │   │
    │   ├── interview/
    │   │   ├── api/
    │   │   │   └── interview.api.ts     # 면접 시작, 답변 제출 API
    │   │   ├── model/
    │   │   │   ├── interview.types.ts   # Session, Answer, SessionStatus, Progress 등
    │   │   │   └── interview.store.ts   # 면접 세션 상태 관리 (현재 질문, 진행률, 타이머)
    │   │   ├── ui/
    │   │   │   ├── InterviewSession.vue # 면접 세션 메인 화면
    │   │   │   ├── QuestionDisplay.vue  # 현재 질문 표시
    │   │   │   ├── AnswerInput.vue      # 답변 입력
    │   │   │   ├── FollowUpPrompt.vue   # 꼬리 질문 표시/응답
    │   │   │   ├── ProgressBar.vue      # 진행률 표시
    │   │   │   └── SessionTimer.vue     # 면접 타이머
    │   │   └── index.ts
    │   │
    │   ├── evaluation/
    │   │   ├── api/
    │   │   │   └── evaluation.api.ts    # 평가 생성, 평가 조회 API
    │   │   ├── model/
    │   │   │   ├── evaluation.types.ts  # Evaluation, EvaluationItem, Scores 등
    │   │   │   └── evaluation.store.ts  # 평가 결과 상태 관리
    │   │   ├── ui/
    │   │   │   ├── EvaluationSummary.vue    # 평가 종합 요약
    │   │   │   ├── EvaluationItemCard.vue   # 질문별 평가 상세
    │   │   │   └── ScoreRadarChart.vue      # 항목별 점수 차트
    │   │   └── index.ts
    │   │
    │   └── report/
    │       ├── api/
    │       │   └── report.api.ts        # 리포트 목록 조회, 리포트 상세 조회 API
    │       ├── model/
    │       │   ├── report.types.ts      # Report, CategoryScore, Grade 등
    │       │   └── report.store.ts      # 리포트 상태 관리
    │       ├── ui/
    │       │   ├── ReportCard.vue       # 리포트 목록 카드
    │       │   ├── ReportDetail.vue     # 리포트 상세
    │       │   ├── GradeBadge.vue       # 등급 배지
    │       │   ├── CategoryScoreChart.vue   # 카테고리별 점수 차트
    │       │   └── StrengthWeakness.vue     # 강점/약점 목록
    │       └── index.ts
    │
    ├── widgets/                         # 페이지 조합용 독립 UI 블록
    │   ├── interview-flow/
    │   │   └── InterviewFlowStepper.vue # 면접 흐름 스텝퍼 (업로드→분석→질문→면접→평가→리포트)
    │   └── dashboard/
    │       └── RecentInterviews.vue     # 최근 면접 요약 위젯
    │
    └── pages/                           # 라우트 단위 페이지
        ├── LoginPage.vue                # /login
        ├── SignupPage.vue               # /signup
        ├── DashboardPage.vue            # / (메인 대시보드)
        ├── ResumeUploadPage.vue         # /resumes/upload
        ├── ResumeDetailPage.vue         # /resumes/:id
        ├── QuestionSetupPage.vue        # /questions/setup/:resumeId
        ├── QuestionPreviewPage.vue      # /question-sets/:id
        ├── InterviewPage.vue            # /interviews/:id
        ├── EvaluationPage.vue           # /evaluations/:sessionId
        ├── ReportListPage.vue           # /reports
        └── ReportDetailPage.vue         # /reports/:sessionId
```

---

## 2. Frontend 폴더 설명

### app/

| 폴더 | 역할 |
|------|------|
| router/ | Vue Router 인스턴스, 라우트 정의, 인증 가드 |
| plugins/ | Element Plus, Pinia 등 외부 라이브러리 초기화 |
| styles/ | 전역 SCSS 변수, 리셋, 공통 스타일 |

### shared/

| 폴더 | 역할 |
|------|------|
| api/ | Axios 인스턴스 (baseURL, 토큰 인터셉터, 에러 핸들링), 공통 응답 타입 |
| types/ | Feature 간 공유되는 범용 타입 |
| utils/ | 순수 함수 유틸리티 (날짜, 파일, 유효성 검증) |
| composables/ | 재사용 가능한 Vue Composition 함수 |
| ui/ | Feature에 속하지 않는 공통 UI 컴포넌트 |
| constants/ | 앱 전역 상수 |

### features/{domain}/

| 폴더 | 역할 |
|------|------|
| api/ | 해당 도메인의 REST API 호출 함수. shared/api/client.ts를 사용 |
| model/ | 도메인 타입 정의, Pinia store (상태 + 액션) |
| ui/ | 도메인 전용 Vue 컴포넌트 |
| index.ts | 외부에 노출할 인터페이스만 re-export |

### pages/

라우트 1:1 매핑 페이지 컴포넌트. features/의 컴포넌트와 widgets/을 조합하여 구성한다.

### widgets/

여러 Feature를 조합하는 독립 UI 블록. 특정 Feature에 속하지 않으며 pages/에서 사용한다.

---

## 3. Backend Directory Tree

```
backend/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── nest-cli.json
├── .env
├── .env.development
├── .env.production
│
├── uploads/                             # PDF 파일 저장 디렉토리
│   └── resumes/
│
└── src/
    ├── main.ts                          # NestJS 앱 부트스트랩
    ├── app.module.ts                    # 루트 모듈
    │
    ├── config/                          # 환경 설정
    │   ├── database.config.ts           # TypeORM 데이터베이스 설정
    │   ├── jwt.config.ts                # JWT 설정 (secret, expiration)
    │   ├── openai.config.ts             # OpenAI API 설정 (apiKey, model, temperature)
    │   ├── upload.config.ts             # 파일 업로드 설정 (경로, 크기 제한)
    │   └── app.config.ts                # 앱 기본 설정 (port, cors)
    │
    ├── common/                          # 공통 모듈
    │   ├── decorators/
    │   │   └── current-user.decorator.ts    # @CurrentUser() 파라미터 데코레이터
    │   ├── guards/
    │   │   └── jwt-auth.guard.ts            # JWT 인증 가드
    │   ├── filters/
    │   │   └── http-exception.filter.ts     # 전역 예외 필터
    │   ├── interceptors/
    │   │   └── transform.interceptor.ts     # 응답 변환 인터셉터
    │   ├── pipes/
    │   │   └── parse-file.pipe.ts           # PDF 파일 유효성 검증 파이프
    │   ├── entities/
    │   │   └── base.entity.ts               # 공통 엔티티 (id, createdAt, updatedAt, deletedAt)
    │   └── types/
    │       ├── pagination.types.ts          # PaginationQuery, PaginatedResult
    │       └── common.types.ts              # 공통 타입
    │
    └── modules/                         # 도메인별 모듈
        │
        ├── auth/
        │   ├── dto/
        │   │   ├── signup.dto.ts            # 회원가입 요청 DTO
        │   │   ├── login.dto.ts             # 로그인 요청 DTO
        │   │   └── auth-response.dto.ts     # 인증 응답 DTO (토큰 + 유저)
        │   ├── entities/
        │   │   ├── user.entity.ts           # User 엔티티
        │   │   └── refresh-token.entity.ts  # RefreshToken 엔티티
        │   ├── strategies/
        │   │   └── jwt.strategy.ts          # Passport JWT Strategy
        │   ├── auth.controller.ts           # POST /auth/signup, POST /auth/login
        │   ├── auth.service.ts              # 인증 비즈니스 로직
        │   └── auth.module.ts
        │
        ├── resume/
        │   ├── dto/
        │   │   ├── upload-resume.dto.ts     # 업로드 요청 DTO
        │   │   └── resume-response.dto.ts   # 이력서 응답 DTO
        │   ├── entities/
        │   │   └── resume.entity.ts         # Resume 엔티티 (PDF + 분석 결과)
        │   ├── resume.controller.ts         # POST /resumes/upload, POST /resumes/:id/analyze, GET /resumes/:id
        │   ├── resume.service.ts            # 이력서 비즈니스 로직
        │   ├── resume.repository.ts         # Resume 조회 커스텀 쿼리
        │   └── resume.module.ts
        │
        ├── question/
        │   ├── dto/
        │   │   ├── generate-questions.dto.ts    # 질문 생성 요청 DTO
        │   │   ├── follow-up-question.dto.ts    # 꼬리 질문 요청 DTO
        │   │   ├── question-set-response.dto.ts # 질문 세트 응답 DTO
        │   │   └── question-response.dto.ts     # 질문 응답 DTO
        │   ├── entities/
        │   │   ├── question-set.entity.ts       # QuestionSet 엔티티
        │   │   └── question.entity.ts           # Question 엔티티 (normal + follow_up)
        │   ├── question.controller.ts       # POST /questions/generate, POST /questions/follow-up, GET /question-sets/:id
        │   ├── question.service.ts          # 질문 생성 비즈니스 로직
        │   ├── question.repository.ts       # Question 조회 커스텀 쿼리
        │   └── question.module.ts
        │
        ├── interview/
        │   ├── dto/
        │   │   ├── create-session.dto.ts        # 면접 시작 요청 DTO
        │   │   ├── submit-answer.dto.ts         # 답변 제출 요청 DTO
        │   │   ├── session-response.dto.ts      # 세션 응답 DTO
        │   │   └── answer-response.dto.ts       # 답변 응답 DTO
        │   ├── entities/
        │   │   ├── interview-session.entity.ts  # InterviewSession 엔티티
        │   │   └── interview-answer.entity.ts   # InterviewAnswer 엔티티
        │   ├── interview.controller.ts      # POST /interviews, POST /interviews/:id/answers
        │   ├── interview.service.ts         # 면접 세션 비즈니스 로직
        │   ├── interview.repository.ts      # Session/Answer 조회 커스텀 쿼리
        │   └── interview.module.ts
        │
        ├── evaluation/
        │   ├── dto/
        │   │   ├── create-evaluation.dto.ts     # 평가 생성 요청 DTO
        │   │   ├── evaluation-response.dto.ts   # 평가 응답 DTO
        │   │   └── evaluation-item-response.dto.ts  # 평가 항목 응답 DTO
        │   ├── entities/
        │   │   ├── evaluation.entity.ts         # Evaluation 엔티티 (세션 헤더)
        │   │   └── evaluation-item.entity.ts    # EvaluationItem 엔티티 (질문별 상세)
        │   ├── evaluation.controller.ts     # POST /evaluations, GET /evaluations/:sessionId
        │   ├── evaluation.service.ts        # 평가 비즈니스 로직
        │   ├── evaluation.repository.ts     # Evaluation 조회 커스텀 쿼리
        │   └── evaluation.module.ts
        │
        ├── report/
        │   ├── dto/
        │   │   ├── report-response.dto.ts       # 리포트 상세 응답 DTO
        │   │   └── report-list-response.dto.ts  # 리포트 목록 응답 DTO
        │   ├── entities/
        │   │   └── report.entity.ts             # Report 엔티티
        │   ├── report.controller.ts         # GET /reports, GET /reports/:sessionId
        │   ├── report.service.ts            # 리포트 비즈니스 로직
        │   ├── report.repository.ts         # Report 조회 커스텀 쿼리
        │   └── report.module.ts
        │
        └── prompt/
            ├── dto/
            │   └── prompt-template.dto.ts       # 프롬프트 템플릿 DTO
            ├── entities/
            │   └── prompt-template.entity.ts    # PromptTemplate 엔티티
            ├── prompt.service.ts             # 프롬프트 조회, 변수 치환
            ├── prompt.repository.ts          # 활성 프롬프트 조회
            └── prompt.module.ts
```

---

## 4. Backend 폴더 설명

### config/

| 파일 | 역할 |
|------|------|
| database.config.ts | TypeORM 연결 설정 (host, port, database, entities, synchronize) |
| jwt.config.ts | JWT secret, access/refresh token 만료 시간 |
| openai.config.ts | OpenAI API key, model (gpt-4), temperature, max_tokens |
| upload.config.ts | PDF 업로드 경로, 최대 파일 크기 (10MB) |
| app.config.ts | 서버 포트, CORS 허용 origin |

### common/

| 폴더 | 역할 |
|------|------|
| decorators/ | `@CurrentUser()` — JWT에서 추출한 사용자 정보 주입 |
| guards/ | `JwtAuthGuard` — 인증 필요 엔드포인트 보호 |
| filters/ | 전역 예외 필터 — API_SPEC의 에러 응답 형식에 맞게 변환 |
| interceptors/ | 응답 직렬화, 로깅 |
| pipes/ | PDF 파일 유효성 검증 (MIME type, 크기) |
| entities/ | `BaseEntity` — id, createdAt, updatedAt, deletedAt 공통 컬럼 |
| types/ | 페이지네이션, 공통 타입 |

### modules/{domain}/

| 폴더/파일 | 역할 |
|----------|------|
| dto/ | 요청/응답 데이터 변환 객체. class-validator 데코레이터로 유효성 검증 |
| entities/ | TypeORM 엔티티. DB_SCHEMA.md 테이블과 1:1 매핑 |
| *.controller.ts | API 엔드포인트 정의. API_SPEC.md와 1:1 매핑 |
| *.service.ts | 비즈니스 로직. OpenAI 호출은 해당 도메인 서비스 내에서 수행 |
| *.repository.ts | TypeORM 커스텀 쿼리 (복잡한 조회, 집계) |
| *.module.ts | NestJS 모듈 선언 (controller, service, repository, imports) |

### modules/prompt/

| 파일 | 역할 |
|------|------|
| prompt-template.entity.ts | DB의 prompt_templates 테이블 매핑 |
| prompt.service.ts | 활성 프롬프트 조회, 변수 치환 ({resumeText} → 실제 값) |
| prompt.module.ts | 다른 모듈에서 import하여 사용 (resume, question, evaluation, report) |

**OpenAI 호출 구조**: 각 도메인 서비스가 `PromptService`를 주입받아 프롬프트를 조회하고, OpenAI API를 직접 호출한다. prompt 모듈은 프롬프트 데이터만 제공하며 AI 호출은 수행하지 않는다.

### Domain별 위치 요약

| Domain | Frontend Feature | Backend Module | 주요 엔티티 | API 엔드포인트 |
|--------|-----------------|----------------|------------|---------------|
| Auth | features/auth/ | modules/auth/ | User, RefreshToken | /auth/signup, /auth/login |
| Resume | features/resume/ | modules/resume/ | Resume | /resumes/upload, /resumes/:id/analyze, /resumes/:id |
| Question | features/question/ | modules/question/ | QuestionSet, Question | /questions/generate, /questions/follow-up, /question-sets/:id |
| Interview | features/interview/ | modules/interview/ | InterviewSession, InterviewAnswer | /interviews, /interviews/:id/answers |
| Evaluation | features/evaluation/ | modules/evaluation/ | Evaluation, EvaluationItem | /evaluations, /evaluations/:sessionId |
| Report | features/report/ | modules/report/ | Report | /reports, /reports/:sessionId |
| Prompt | - | modules/prompt/ | PromptTemplate | 내부 전용 (API 없음) |

---

## 5. 초기 생성 파일 목록

### Phase 1: 프로젝트 초기화

```
# Frontend
frontend/package.json
frontend/tsconfig.json
frontend/vite.config.ts
frontend/env.d.ts
frontend/.env.development
frontend/src/main.ts
frontend/src/app/App.vue
frontend/src/app/router/index.ts
frontend/src/app/plugins/element-plus.ts
frontend/src/app/plugins/pinia.ts
frontend/src/app/styles/variables.scss
frontend/src/app/styles/global.scss

# Backend
backend/package.json
backend/tsconfig.json
backend/tsconfig.build.json
backend/nest-cli.json
backend/.env.development
backend/src/main.ts
backend/src/app.module.ts
backend/src/config/database.config.ts
backend/src/config/jwt.config.ts
backend/src/config/openai.config.ts
backend/src/config/upload.config.ts
backend/src/config/app.config.ts
```

### Phase 2: 공통 모듈

```
# Frontend shared
frontend/src/shared/api/client.ts
frontend/src/shared/api/types.ts
frontend/src/shared/types/index.ts
frontend/src/shared/constants/index.ts
frontend/src/shared/utils/date.ts
frontend/src/shared/utils/file.ts
frontend/src/shared/utils/validation.ts
frontend/src/shared/composables/use-loading.ts
frontend/src/shared/composables/use-pagination.ts
frontend/src/shared/ui/AppHeader.vue
frontend/src/shared/ui/AppLayout.vue
frontend/src/shared/ui/EmptyState.vue

# Backend common
backend/src/common/entities/base.entity.ts
backend/src/common/decorators/current-user.decorator.ts
backend/src/common/guards/jwt-auth.guard.ts
backend/src/common/filters/http-exception.filter.ts
backend/src/common/interceptors/transform.interceptor.ts
backend/src/common/pipes/parse-file.pipe.ts
backend/src/common/types/pagination.types.ts
backend/src/common/types/common.types.ts
```

### Phase 3: Auth

```
# Backend
backend/src/modules/auth/entities/user.entity.ts
backend/src/modules/auth/entities/refresh-token.entity.ts
backend/src/modules/auth/dto/signup.dto.ts
backend/src/modules/auth/dto/login.dto.ts
backend/src/modules/auth/dto/auth-response.dto.ts
backend/src/modules/auth/strategies/jwt.strategy.ts
backend/src/modules/auth/auth.controller.ts
backend/src/modules/auth/auth.service.ts
backend/src/modules/auth/auth.module.ts

# Frontend
frontend/src/features/auth/model/auth.types.ts
frontend/src/features/auth/model/auth.store.ts
frontend/src/features/auth/api/auth.api.ts
frontend/src/features/auth/ui/LoginForm.vue
frontend/src/features/auth/ui/SignupForm.vue
frontend/src/features/auth/index.ts
frontend/src/pages/LoginPage.vue
frontend/src/pages/SignupPage.vue
frontend/src/app/router/guards.ts
```

### Phase 4: Resume

```
# Backend
backend/src/modules/resume/entities/resume.entity.ts
backend/src/modules/resume/dto/upload-resume.dto.ts
backend/src/modules/resume/dto/resume-response.dto.ts
backend/src/modules/resume/resume.controller.ts
backend/src/modules/resume/resume.service.ts
backend/src/modules/resume/resume.repository.ts
backend/src/modules/resume/resume.module.ts

# Backend (Prompt - Resume 분석용)
backend/src/modules/prompt/entities/prompt-template.entity.ts
backend/src/modules/prompt/dto/prompt-template.dto.ts
backend/src/modules/prompt/prompt.service.ts
backend/src/modules/prompt/prompt.repository.ts
backend/src/modules/prompt/prompt.module.ts

# Frontend
frontend/src/features/resume/model/resume.types.ts
frontend/src/features/resume/model/resume.store.ts
frontend/src/features/resume/api/resume.api.ts
frontend/src/features/resume/ui/ResumeUploader.vue
frontend/src/features/resume/ui/ResumeAnalysis.vue
frontend/src/features/resume/ui/SkillTagList.vue
frontend/src/features/resume/ui/ResumeDetail.vue
frontend/src/features/resume/index.ts
frontend/src/pages/ResumeUploadPage.vue
frontend/src/pages/ResumeDetailPage.vue
```

### Phase 5: Question

```
# Backend
backend/src/modules/question/entities/question-set.entity.ts
backend/src/modules/question/entities/question.entity.ts
backend/src/modules/question/dto/generate-questions.dto.ts
backend/src/modules/question/dto/follow-up-question.dto.ts
backend/src/modules/question/dto/question-set-response.dto.ts
backend/src/modules/question/dto/question-response.dto.ts
backend/src/modules/question/question.controller.ts
backend/src/modules/question/question.service.ts
backend/src/modules/question/question.repository.ts
backend/src/modules/question/question.module.ts

# Frontend
frontend/src/features/question/model/question.types.ts
frontend/src/features/question/model/question.store.ts
frontend/src/features/question/api/question.api.ts
frontend/src/features/question/ui/QuestionGenerator.vue
frontend/src/features/question/ui/QuestionSetPreview.vue
frontend/src/features/question/ui/QuestionCard.vue
frontend/src/features/question/index.ts
frontend/src/pages/QuestionSetupPage.vue
frontend/src/pages/QuestionPreviewPage.vue
```

### Phase 6: Interview

```
# Backend
backend/src/modules/interview/entities/interview-session.entity.ts
backend/src/modules/interview/entities/interview-answer.entity.ts
backend/src/modules/interview/dto/create-session.dto.ts
backend/src/modules/interview/dto/submit-answer.dto.ts
backend/src/modules/interview/dto/session-response.dto.ts
backend/src/modules/interview/dto/answer-response.dto.ts
backend/src/modules/interview/interview.controller.ts
backend/src/modules/interview/interview.service.ts
backend/src/modules/interview/interview.repository.ts
backend/src/modules/interview/interview.module.ts

# Frontend
frontend/src/features/interview/model/interview.types.ts
frontend/src/features/interview/model/interview.store.ts
frontend/src/features/interview/api/interview.api.ts
frontend/src/features/interview/ui/InterviewSession.vue
frontend/src/features/interview/ui/QuestionDisplay.vue
frontend/src/features/interview/ui/AnswerInput.vue
frontend/src/features/interview/ui/FollowUpPrompt.vue
frontend/src/features/interview/ui/ProgressBar.vue
frontend/src/features/interview/ui/SessionTimer.vue
frontend/src/features/interview/index.ts
frontend/src/pages/InterviewPage.vue
```

### Phase 7: Evaluation

```
# Backend
backend/src/modules/evaluation/entities/evaluation.entity.ts
backend/src/modules/evaluation/entities/evaluation-item.entity.ts
backend/src/modules/evaluation/dto/create-evaluation.dto.ts
backend/src/modules/evaluation/dto/evaluation-response.dto.ts
backend/src/modules/evaluation/dto/evaluation-item-response.dto.ts
backend/src/modules/evaluation/evaluation.controller.ts
backend/src/modules/evaluation/evaluation.service.ts
backend/src/modules/evaluation/evaluation.repository.ts
backend/src/modules/evaluation/evaluation.module.ts

# Frontend
frontend/src/features/evaluation/model/evaluation.types.ts
frontend/src/features/evaluation/model/evaluation.store.ts
frontend/src/features/evaluation/api/evaluation.api.ts
frontend/src/features/evaluation/ui/EvaluationSummary.vue
frontend/src/features/evaluation/ui/EvaluationItemCard.vue
frontend/src/features/evaluation/ui/ScoreRadarChart.vue
frontend/src/features/evaluation/index.ts
frontend/src/pages/EvaluationPage.vue
```

### Phase 8: Report

```
# Backend
backend/src/modules/report/entities/report.entity.ts
backend/src/modules/report/dto/report-response.dto.ts
backend/src/modules/report/dto/report-list-response.dto.ts
backend/src/modules/report/report.controller.ts
backend/src/modules/report/report.service.ts
backend/src/modules/report/report.repository.ts
backend/src/modules/report/report.module.ts

# Frontend
frontend/src/features/report/model/report.types.ts
frontend/src/features/report/model/report.store.ts
frontend/src/features/report/api/report.api.ts
frontend/src/features/report/ui/ReportCard.vue
frontend/src/features/report/ui/ReportDetail.vue
frontend/src/features/report/ui/GradeBadge.vue
frontend/src/features/report/ui/CategoryScoreChart.vue
frontend/src/features/report/ui/StrengthWeakness.vue
frontend/src/features/report/index.ts
frontend/src/pages/ReportListPage.vue
frontend/src/pages/ReportDetailPage.vue

# Dashboard / Widgets
frontend/src/widgets/interview-flow/InterviewFlowStepper.vue
frontend/src/widgets/dashboard/RecentInterviews.vue
frontend/src/pages/DashboardPage.vue
```

---

## 6. 개발 순서 추천

```
Phase 1. 프로젝트 초기화
├── Frontend: Vite + Vue3 + TypeScript 프로젝트 생성
├── Backend: NestJS 프로젝트 생성
├── 환경 설정 파일 구성
└── 데이터베이스 연결 확인

Phase 2. 공통 모듈
├── Frontend: Axios 클라이언트, 공통 타입, 레이아웃
├── Backend: BaseEntity, JWT Guard, Exception Filter, Pipes
└── 공통 모듈 동작 검증

Phase 3. Auth (인증)
├── Backend: User/RefreshToken 엔티티, 회원가입/로그인 API
├── Frontend: 로그인/회원가입 폼, 인증 store, 라우터 가드
└── 인증 흐름 E2E 검증

Phase 4. Resume (이력서)
├── Backend: Resume 엔티티, PDF 업로드/분석 API, OpenAI 연동
├── Backend: Prompt 모듈 (프롬프트 템플릿 관리)
├── Frontend: PDF 업로더, 분석 결과 표시
└── 이력서 업로드 → 분석 흐름 검증

Phase 5. Question (질문)
├── Backend: QuestionSet/Question 엔티티, 질문 생성/꼬리 질문 API
├── Frontend: 질문 생성 설정, 질문 세트 미리보기
└── 이력서 → 질문 생성 흐름 검증

Phase 6. Interview (면접)
├── Backend: Session/Answer 엔티티, 면접 시작/답변 제출 API
├── Frontend: 면접 세션 UI, 답변 입력, 꼬리 질문, 타이머
└── 질문 세트 → 면접 진행 흐름 검증

Phase 7. Evaluation (평가)
├── Backend: Evaluation/EvaluationItem 엔티티, 평가 생성/조회 API
├── Frontend: 평가 결과 표시, 점수 차트
└── 면접 완료 → 평가 생성 흐름 검증

Phase 8. Report (리포트)
├── Backend: Report 엔티티, 리포트 생성/목록/상세 API
├── Frontend: 리포트 목록, 상세, 차트, 대시보드
└── 전체 흐름 E2E 검증
    (이력서 업로드 → 분석 → 질문 생성 → 면접 → 평가 → 리포트)
```

**핵심 원칙**: 도메인 흐름 순서(Resume → Question → Interview → Evaluation → Report)를 따라 개발한다. 각 Phase 완료 시 이전 Phase와의 연동을 검증한 후 다음으로 진행한다.
