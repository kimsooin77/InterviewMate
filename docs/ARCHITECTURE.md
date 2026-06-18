# Architecture

## 1. Domain

### Auth
사용자 인증 및 인가를 담당한다.
- 회원가입, 로그인, 로그아웃
- JWT 토큰 발급 및 검증
- 세션 관리

### Resume
PDF 이력서 업로드 및 AI 분석을 담당한다.
- PDF 이력서 파일 업로드 및 저장
- OpenAI API를 활용한 이력서 분석
- 기술 스택 자동 추출
- 프로젝트 경험 자동 추출
- 경력 정보 자동 추출
- 분석 결과 관리

### Question
이력서 기반 면접 질문 생성을 담당한다.
- OpenAI API를 활용한 맞춤형 질문 생성
- 질문 난이도 및 카테고리 분류
- 질문 세트 구성, 저장 및 조회
- 꼬리 질문(Follow-up Question) 생성

### Interview
실시간 면접 세션 진행을 담당한다.
- 면접 세션 생성 및 상태 관리
- 질문 순차 제시
- 사용자 답변 수집 및 저장
- 타이머 및 세션 흐름 제어

### Evaluation
면접 답변에 대한 AI 평가를 담당한다.
- 세션 완료 후 평가 생성 요청
- OpenAI API를 활용한 답변 평가
- 항목별 점수 산정 (정확성, 깊이, 구조 등)
- 개선 피드백 생성

### Report
면접 결과 리포트 생성 및 조회를 담당한다.
- 종합 점수 및 등급 산출
- 항목별 분석 결과 집계
- 강점/약점 요약
- 리포트 목록 조회 (면접 이력)

---

## 2. Domain 관계

```
Auth ──────────────────────────────────────────
 │ (인증된 사용자만 접근 가능)
 ▼
Resume ─────► Question ─────► Interview
 (PDF 업로드     │ (질문 생성         │
  + AI 분석)     │  + 꼬리 질문)      │
                 │                    │
                 │                    ▼
                 │                Evaluation
                 │                (평가 생성)
                 │                    │
                 │                    ▼
                 │                 Report
                 │               (리포트 생성
                 │                + 목록 조회)
                 │                    │
                 └────────────────────┘
                  (질문 원본 참조)
```

| 관계 | 방향 | 설명 |
|------|------|------|
| Auth → 전체 도메인 | 단방향 | 모든 도메인은 인증을 전제로 동작한다 |
| Resume → Question | 단방향 | 분석된 이력서 데이터를 기반으로 질문을 생성한다 |
| Question → Interview | 단방향 | 생성된 질문 세트로 면접 세션을 구성한다 |
| Question → Question | 내부 | 답변 기반으로 꼬리 질문을 생성한다 |
| Interview → Evaluation | 단방향 | 수집된 답변을 평가 도메인에 전달한다 |
| Evaluation → Report | 단방향 | 평가 결과를 기반으로 리포트를 생성한다 |
| Report → Question | 참조 | 리포트에서 원본 질문을 참조한다 |

---

## 3. Event Flow

### 면접 시뮬레이션 전체 흐름

```
[사용자 인증]
    │
    ▼
ResumeUploaded
    │  PDF 이력서 파일 업로드 완료
    ▼
ResumeAnalysisRequested
    │  업로드된 PDF 분석 요청
    ▼
ResumeAnalysisCompleted
    │  AI가 기술 스택, 프로젝트, 경력 추출 완료
    ▼
QuestionGenerationRequested
    │  분석된 이력서를 기반으로 질문 생성 요청
    ▼
QuestionSetGenerated
    │  AI가 질문 세트 생성 완료
    ▼
QuestionSetReviewed
    │  면접 시작 전 질문 목록 확인
    ▼
InterviewSessionStarted
    │  면접 세션 시작
    ▼
AnswerSubmitted (반복)
    │  각 질문에 대한 답변 제출
    ├──► FollowUpQuestionGenerated (선택)
    │       │  답변 기반 꼬리 질문 생성
    │       ▼
    │    FollowUpAnswerSubmitted
    │       │  꼬리 질문에 대한 답변 제출
    ▼
InterviewSessionCompleted
    │  모든 질문 답변 완료 또는 세션 종료
    ▼
EvaluationRequested
    │  평가 생성 요청 (POST /evaluations)
    ▼
EvaluationCompleted
    │  AI 평가 완료
    ▼
ReportGenerated
    │  최종 리포트 생성 완료
    ▼
[리포트 조회 / 리포트 목록 조회]
```

### 주요 이벤트 상세

| 이벤트 | 발행 도메인 | 소비 도메인 | 페이로드 |
|--------|------------|------------|----------|
| ResumeUploaded | Resume | Resume (내부) | resumeId, filePath |
| ResumeAnalysisRequested | Resume | Resume (내부) | resumeId |
| ResumeAnalysisCompleted | Resume | Question | resumeId, skills[], projects[], careers[] |
| QuestionGenerationRequested | Question | Question (내부) | resumeId, config |
| QuestionSetGenerated | Question | Interview | questionSetId |
| FollowUpQuestionGenerated | Question | Interview | parentQuestionId, followUpQuestionId |
| InterviewSessionStarted | Interview | - | sessionId, questionSetId |
| AnswerSubmitted | Interview | Interview (내부) | sessionId, questionId, answer |
| InterviewSessionCompleted | Interview | Evaluation | sessionId |
| EvaluationRequested | Evaluation | Evaluation (내부) | sessionId |
| EvaluationCompleted | Evaluation | Report | sessionId, evaluationId |
| ReportGenerated | Report | - | reportId |

---

## 4. Bounded Context

### Context Map

```
┌─────────────────────────────────────────────────────┐
│                    Auth Context                      │
│  - User, Token, Session                             │
│  - 다른 Context와 독립적으로 동작                      │
└──────────────────────┬──────────────────────────────┘
                       │ (userId)
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
┌──────────────┐ ┌───────────┐ ┌───────────┐
│Resume Context│ │  Report   │ │ Interview │
│              │ │  Context  │ │  Context  │
│ - Resume     │ │           │ │           │
│ - PDF File   │ │ - Report  │ │ - Session │
│ - Analysis   │ │ - Summary │ │ - Answer  │
│ - Skill      │ │ - Score   │ │ - Timer   │
│ - Project    │ │           │ │           │
│ - Career     │ │           │ │           │
└──────┬───────┘ └─────▲─────┘ └──┬────▲───┘
       │               │          │    │
       ▼               │          ▼    │
┌──────────────┐       │  ┌────────────────┐
│  Question    │       │  │  Evaluation    │
│  Context     │       │  │  Context       │
│              │───────┘  │                │
│ - QuestionSet│(참조)    │ - Evaluation   │
│ - Question   │          │ - Criteria     │
│ - FollowUp   │          │ - Feedback     │
│ - Category   │          │                │
│ - Difficulty │          │                │
└──────────────┘          └────────────────┘
```

### Context 간 통신 규칙

| 규칙 | 설명 |
|------|------|
| ID 참조 | Context 간에는 엔티티 직접 참조 대신 ID로만 참조한다 |
| 단방향 의존 | 상위 Context가 하위 Context를 알지 못한다 |
| 자체 모델 | 각 Context는 필요한 데이터의 자체 표현을 유지한다 |
| Anti-Corruption Layer | 외부 Context 데이터를 수신할 때 자체 모델로 변환한다 |

### Context별 경계 정의

| Context | 핵심 엔티티 | 외부 의존 | 공유 식별자 |
|---------|------------|----------|------------|
| Auth | User, Token | 없음 | userId |
| Resume | Resume, PdfFile, Analysis | Auth(userId), OpenAI API | resumeId |
| Question | QuestionSet, Question, FollowUpQuestion | Resume(resumeId), OpenAI API | questionSetId, questionId |
| Interview | Session, Answer | Question(questionSetId) | sessionId |
| Evaluation | Evaluation, Criteria, Feedback | Interview(sessionId), OpenAI API | evaluationId |
| Report | Report, Summary, Score | Evaluation(evaluationId), Question(questionId) | reportId |
