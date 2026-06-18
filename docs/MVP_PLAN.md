# 1st MVP Development Plan

InterviewMate 1차 MVP 개발 계획

---

## MVP 범위 정의

### 포함 기능 (MVP)

- 회원가입 / 로그인
- PDF 이력서 업로드 + AI 분석
- 이력서 기반 질문 생성
- 면접 세션 진행 (답변 제출)
- AI 평가 생성 + 조회
- 리포트 생성 + 조회

### 제외 기능 (Post-MVP)

- 꼬리 질문 (Follow-up Question)
- 리포트 목록 조회 (페이지네이션)
- 면접 타이머
- 대시보드 위젯
- 프롬프트 템플릿 DB 관리 (하드코딩으로 대체)

---

## Phase 1: 프로젝트 초기화 + Auth

### 목표

프로젝트 기반 구성을 완료하고 인증 흐름을 구현한다.
이 Phase가 완료되면 회원가입, 로그인, 인증된 API 호출이 가능해야 한다.

### Phase 1-1: 프로젝트 초기화

#### Backend 파일

```
backend/package.json
backend/tsconfig.json
backend/tsconfig.build.json
backend/nest-cli.json
backend/.env.development
backend/src/main.ts
backend/src/app.module.ts
backend/src/config/database.config.ts
backend/src/config/jwt.config.ts
backend/src/config/app.config.ts
```

#### Frontend 파일

```
frontend/package.json
frontend/tsconfig.json
frontend/vite.config.ts
frontend/env.d.ts
frontend/index.html
frontend/.env.development
frontend/src/main.ts
frontend/src/app/App.vue
frontend/src/app/router/index.ts
frontend/src/app/plugins/element-plus.ts
frontend/src/app/plugins/pinia.ts
frontend/src/app/styles/variables.scss
frontend/src/app/styles/global.scss
```

#### 구현 내용

- Backend: NestJS 프로젝트 생성, TypeORM + PostgreSQL 연결 확인
- Frontend: Vite + Vue3 + TypeScript 프로젝트 생성, Element Plus + Pinia 설정
- 환경 변수 구성 (.env.development)
- 양쪽 서버 기동 확인

---

### Phase 1-2: 공통 모듈

#### Backend 파일

```
backend/src/common/entities/base.entity.ts
backend/src/common/decorators/current-user.decorator.ts
backend/src/common/guards/jwt-auth.guard.ts
backend/src/common/filters/http-exception.filter.ts
backend/src/common/interceptors/transform.interceptor.ts
backend/src/common/types/pagination.types.ts
backend/src/common/types/common.types.ts
```

#### Frontend 파일

```
frontend/src/shared/api/client.ts
frontend/src/shared/api/types.ts
frontend/src/shared/types/index.ts
frontend/src/shared/constants/index.ts
frontend/src/shared/utils/date.ts
frontend/src/shared/utils/validation.ts
frontend/src/shared/ui/AppHeader.vue
frontend/src/shared/ui/AppLayout.vue
```

#### 구현 내용

- Backend: BaseEntity (id, createdAt, updatedAt, deletedAt), JWT Guard, Exception Filter
- Frontend: Axios 인스턴스 (baseURL, 토큰 인터셉터, 에러 핸들링), 공통 레이아웃
- 공통 타입 정의

---

### Phase 1-3: Auth 모듈

#### Backend 파일

```
backend/src/modules/auth/entities/user.entity.ts
backend/src/modules/auth/entities/refresh-token.entity.ts
backend/src/modules/auth/dto/signup.dto.ts
backend/src/modules/auth/dto/login.dto.ts
backend/src/modules/auth/dto/auth-response.dto.ts
backend/src/modules/auth/strategies/jwt.strategy.ts
backend/src/modules/auth/auth.controller.ts
backend/src/modules/auth/auth.service.ts
backend/src/modules/auth/auth.module.ts
```

#### Frontend 파일

```
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

#### 구현 내용

- Backend
  - `POST /auth/signup` — 회원가입 (이메일 중복 검증, 비밀번호 해싱)
  - `POST /auth/login` — 로그인 (JWT accessToken + refreshToken 발급)
  - User 엔티티, RefreshToken 엔티티
  - Passport JWT Strategy
- Frontend
  - 로그인 / 회원가입 페이지 UI
  - Pinia auth store (토큰 저장, 로그인 상태 관리)
  - Axios 인터셉터에서 accessToken 자동 주입
  - 라우터 가드 (비인증 사용자 리다이렉트)

#### 검증 기준

- 회원가입 → 로그인 → 토큰 발급 → 인증 필요 API에 토큰 포함 요청 성공

---

## Phase 2: Resume + Question

### 목표

이력서 업로드부터 질문 생성까지의 흐름을 구현한다.
이 Phase가 완료되면 PDF 업로드 → AI 분석 → 질문 세트 생성 → 질문 목록 확인이 가능해야 한다.

### Phase 2-1: Resume 모듈

#### Backend 파일

```
backend/src/config/openai.config.ts
backend/src/config/upload.config.ts
backend/src/common/pipes/parse-file.pipe.ts
backend/src/modules/resume/entities/resume.entity.ts
backend/src/modules/resume/dto/upload-resume.dto.ts
backend/src/modules/resume/dto/resume-response.dto.ts
backend/src/modules/resume/resume.controller.ts
backend/src/modules/resume/resume.service.ts
backend/src/modules/resume/resume.repository.ts
backend/src/modules/resume/resume.module.ts
```

#### Frontend 파일

```
frontend/src/shared/utils/file.ts
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

#### 구현 내용

- Backend
  - `POST /resumes/upload` — PDF 파일 업로드 (Multer, 10MB 제한, PDF 검증)
  - `POST /resumes/:id/analyze` — PDF 텍스트 추출 + OpenAI API로 분석 (skills, careers, projects 추출)
  - `GET /resumes/:id` — 이력서 조회
  - Resume 엔티티 (analysis_status 상태 전이: pending → analyzing → completed/failed)
  - OpenAI config 설정
  - Resume Analysis Prompt 하드코딩 (PROMPTS.md 기반)
- Frontend
  - PDF 드래그 앤 드롭 업로더 (파일 크기/형식 검증)
  - 업로드 후 분석 요청 버튼
  - 분석 결과 표시 (기술 스택 태그, 경력, 프로젝트)
  - 이력서 상세 페이지

#### 검증 기준

- PDF 업로드 → 분석 요청 → skills/careers/projects 추출 결과 화면 표시

---

### Phase 2-2: Question 모듈

#### Backend 파일

```
backend/src/modules/question/entities/question-set.entity.ts
backend/src/modules/question/entities/question.entity.ts
backend/src/modules/question/dto/generate-questions.dto.ts
backend/src/modules/question/dto/question-set-response.dto.ts
backend/src/modules/question/dto/question-response.dto.ts
backend/src/modules/question/question.controller.ts
backend/src/modules/question/question.service.ts
backend/src/modules/question/question.repository.ts
backend/src/modules/question/question.module.ts
```

#### Frontend 파일

```
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

#### 구현 내용

- Backend
  - `POST /questions/generate` — 분석된 이력서 기반 질문 생성 (OpenAI API)
  - `GET /question-sets/:id` — 질문 세트 조회
  - QuestionSet, Question 엔티티
  - question_type은 MVP에서 'normal'만 사용
  - Question Generation Prompt 하드코딩 (PROMPTS.md 기반)
- Frontend
  - 질문 생성 설정 UI (난이도 선택, 질문 개수)
  - 질문 세트 미리보기 (카테고리별 정렬, 질문 카드)
  - "면접 시작" 버튼으로 Phase 3 연결

#### 검증 기준

- 분석된 이력서 선택 → 난이도/개수 설정 → 질문 생성 → 질문 목록 확인

---

## Phase 3: Interview + Evaluation + Report

### 목표

면접 진행부터 리포트 확인까지의 전체 흐름을 구현한다.
이 Phase가 완료되면 MVP의 전체 사용자 여정이 완성된다.

### Phase 3-1: Interview 모듈

#### Backend 파일

```
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
```

#### Frontend 파일

```
frontend/src/features/interview/model/interview.types.ts
frontend/src/features/interview/model/interview.store.ts
frontend/src/features/interview/api/interview.api.ts
frontend/src/features/interview/ui/InterviewSession.vue
frontend/src/features/interview/ui/QuestionDisplay.vue
frontend/src/features/interview/ui/AnswerInput.vue
frontend/src/features/interview/ui/ProgressBar.vue
frontend/src/features/interview/index.ts
frontend/src/pages/InterviewPage.vue
```

#### 구현 내용

- Backend
  - `POST /interviews` — 면접 세션 생성 (questionSetId 기반)
  - `POST /interviews/:id/answers` — 답변 제출 + 다음 질문 반환
  - InterviewSession 엔티티 (status: in_progress → completed)
  - InterviewAnswer 엔티티 (session_id + question_id UNIQUE)
  - 마지막 답변 제출 시 세션 자동 완료
- Frontend
  - 면접 세션 메인 화면 (현재 질문 표시, 답변 입력)
  - 진행률 표시 (current / total)
  - 답변 제출 → 다음 질문 전환
  - 마지막 질문 완료 시 평가 페이지로 이동

#### 검증 기준

- 질문 세트 선택 → 면접 시작 → 순차 답변 제출 → 세션 완료

---

### Phase 3-2: Evaluation 모듈

#### Backend 파일

```
backend/src/modules/evaluation/entities/evaluation.entity.ts
backend/src/modules/evaluation/entities/evaluation-item.entity.ts
backend/src/modules/evaluation/dto/create-evaluation.dto.ts
backend/src/modules/evaluation/dto/evaluation-response.dto.ts
backend/src/modules/evaluation/dto/evaluation-item-response.dto.ts
backend/src/modules/evaluation/evaluation.controller.ts
backend/src/modules/evaluation/evaluation.service.ts
backend/src/modules/evaluation/evaluation.repository.ts
backend/src/modules/evaluation/evaluation.module.ts
```

#### Frontend 파일

```
frontend/src/features/evaluation/model/evaluation.types.ts
frontend/src/features/evaluation/model/evaluation.store.ts
frontend/src/features/evaluation/api/evaluation.api.ts
frontend/src/features/evaluation/ui/EvaluationSummary.vue
frontend/src/features/evaluation/ui/EvaluationItemCard.vue
frontend/src/features/evaluation/ui/ScoreRadarChart.vue
frontend/src/features/evaluation/index.ts
frontend/src/pages/EvaluationPage.vue
```

#### 구현 내용

- Backend
  - `POST /evaluations` — 세션의 모든 답변을 OpenAI로 평가 생성
  - `GET /evaluations/:sessionId` — 평가 결과 조회
  - Evaluation 엔티티 (세션 단위 헤더, overall_score)
  - EvaluationItem 엔티티 (질문별 scores, feedback, strengths, improvements)
  - Answer Evaluation Prompt 하드코딩 (PROMPTS.md 기반)
  - 답변별 OpenAI 호출 → 전체 결과 집계 → overall_score 계산
- Frontend
  - 면접 완료 후 "평가 요청" 버튼
  - 종합 점수 표시
  - 질문별 평가 상세 카드 (점수, 피드백, 강점/약점)
  - 점수 레이더 차트 (accuracy, depth, structure, communication)

#### 검증 기준

- 완료된 세션 → 평가 생성 요청 → 질문별 평가 결과 + 종합 점수 표시

---

### Phase 3-3: Report 모듈

#### Backend 파일

```
backend/src/modules/report/entities/report.entity.ts
backend/src/modules/report/dto/report-response.dto.ts
backend/src/modules/report/report.controller.ts
backend/src/modules/report/report.service.ts
backend/src/modules/report/report.repository.ts
backend/src/modules/report/report.module.ts
```

#### Frontend 파일

```
frontend/src/features/report/model/report.types.ts
frontend/src/features/report/model/report.store.ts
frontend/src/features/report/api/report.api.ts
frontend/src/features/report/ui/ReportDetail.vue
frontend/src/features/report/ui/GradeBadge.vue
frontend/src/features/report/ui/CategoryScoreChart.vue
frontend/src/features/report/ui/StrengthWeakness.vue
frontend/src/features/report/index.ts
frontend/src/pages/ReportDetailPage.vue
```

#### 구현 내용

- Backend
  - `GET /reports/:sessionId` — 리포트 상세 조회
  - 평가 완료 시 자동 리포트 생성 (evaluation.service에서 호출)
  - Report 엔티티 (overall_score, grade, summary, categoryScores, strengths, improvements)
  - Report Generation Prompt 하드코딩 (PROMPTS.md 기반)
  - 등급 산출 로직 (90+: A+, 85+: A, 80+: B+, ...)
- Frontend
  - 리포트 상세 페이지 (등급 배지, 종합 요약)
  - 카테고리별 점수 차트
  - 강점/약점 목록
  - 질문별 점수 요약

#### 검증 기준

- 평가 완료 → 리포트 자동 생성 → 등급, 요약, 카테고리 점수, 강점/약점 표시

---

## Phase 요약

| Phase | 범위 | 생성 파일 수 | 핵심 검증 |
|-------|------|:-----------:|----------|
| **1-1** | 프로젝트 초기화 | 15 | 서버 기동 확인 |
| **1-2** | 공통 모듈 | 15 | Axios 인터셉터, Guard 동작 |
| **1-3** | Auth | 19 | 회원가입 → 로그인 → 토큰 인증 |
| **2-1** | Resume | 22 | PDF 업로드 → AI 분석 → 결과 표시 |
| **2-2** | Question | 18 | 질문 생성 → 세트 미리보기 |
| **3-1** | Interview | 17 | 면접 세션 진행 → 답변 제출 → 완료 |
| **3-2** | Evaluation | 16 | 평가 생성 → 질문별 평가 표시 |
| **3-3** | Report | 14 | 리포트 자동 생성 → 상세 조회 |
| **합계** | | **136** | |

---

## MVP 전체 사용자 여정

```
회원가입 → 로그인
    ↓
PDF 이력서 업로드
    ↓
AI 이력서 분석 (기술 스택, 경력, 프로젝트 추출)
    ↓
질문 생성 설정 (난이도, 개수 선택)
    ↓
질문 세트 미리보기
    ↓
면접 시작 → 질문별 답변 제출 → 면접 완료
    ↓
AI 평가 생성 (질문별 점수 + 피드백)
    ↓
종합 리포트 조회 (등급, 카테고리 점수, 강점/약점)
```

---

## MVP 이후 확장 (Post-MVP)

| 기능 | 설명 | 의존 Phase |
|------|------|-----------|
| 꼬리 질문 | POST /questions/follow-up, FollowUpPrompt.vue | Phase 3-1 |
| 리포트 목록 | GET /reports, ReportListPage, 페이지네이션 | Phase 3-3 |
| 대시보드 | DashboardPage, RecentInterviews 위젯 | Phase 3-3 |
| 면접 타이머 | SessionTimer.vue | Phase 3-1 |
| 프롬프트 DB 관리 | prompt 모듈, prompt_templates 테이블 | Phase 2-1 |
| Soft Delete | deleted_at 컬럼 활성화 | Phase 1-2 |
