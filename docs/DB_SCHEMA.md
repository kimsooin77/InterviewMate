# Database Schema

PostgreSQL 기준

---

## ERD

```
┌──────────────────┐
│      users       │
│──────────────────│
│ PK id            │
│    email         │
│    password      │
│    name          │
│    created_at    │
│    updated_at    │
│    deleted_at    │
└──┬───────────┬───┘
   │           │
   │ 1:N       │ 1:N
   ▼           ▼
┌──────────────────┐  ┌──────────────────┐
│    resumes       │  │  refresh_tokens  │
│──────────────────│  │──────────────────│
│ PK id            │  │ PK id            │
│ FK user_id       │  │ FK user_id       │
│    title         │  │    token         │
│    file_name     │  │    expires_at    │
│    file_path     │  │    created_at    │
│    file_size     │  └──────────────────┘
│    raw_text      │
│    analysis_status│
│    skills        │
│    careers       │
│    projects      │
│    analysis_completed_at│
│    created_at    │
│    updated_at    │
│    deleted_at    │
└──────┬───────────┘
       │
       │ 1:N
       ▼
┌──────────────────┐                    ┌──────────────────┐
│  question_sets   │                    │  prompt_templates │
│──────────────────│                    │──────────────────│
│ PK id            │                    │ PK id            │
│ FK resume_id     │                    │    name          │
│    difficulty    │                    │    type          │
│    question_count│                    │    system_prompt │
│    created_at    │                    │    user_prompt   │
│    deleted_at    │                    │    version       │
└──────┬───────────┘                    │    is_active     │
       │                                │    created_at    │
       │ 1:N                            └──────────────────┘
       ▼
┌──────────────────┐
│    questions     │
│──────────────────│
│ PK id            │
│ FK question_set_id│
│ FK parent_question_id│
│    content       │
│    category      │
│    difficulty    │
│    "order"       │
│    question_type │
│    created_at    │
└────────┬─────────┘
         │ (self 1:N)
         │
         ▼
┌──────────────────┐
│interview_sessions│
│──────────────────│
│ PK id            │
│ FK user_id       │
│ FK resume_id     │
│ FK question_set_id│
│    status        │
│    total_questions│
│    difficulty    │
│    started_at    │
│    completed_at  │
│    created_at    │
│    deleted_at    │
└──┬───────────┬───┘
   │           │
   │ 1:N       │ 1:N          1:1
   ▼           ▼               ▼
┌────────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ interview_answers  │  │   evaluations    │  │     reports      │
│────────────────────│  │──────────────────│  │──────────────────│
│ PK id              │  │ PK id            │  │ PK id            │
│ FK session_id      │  │ FK session_id    │  │ FK session_id    │
│ FK question_id     │  │    overall_score │  │    overall_score │
│    content         │  │    created_at    │  │    grade         │
│    submitted_at    │  └──────┬───────────┘  │    summary       │
│    created_at      │         │              │    strengths     │
└────────────────────┘         │ 1:N          │    improvements  │
                               ▼              │    category_scores│
                    ┌──────────────────┐      │    metadata      │
                    │ evaluation_items │      │    created_at    │
                    │──────────────────│      │    deleted_at    │
                    │ PK id            │      └──────────────────┘
                    │ FK evaluation_id │
                    │ FK question_id   │
                    │ FK answer_id     │
                    │    scores        │
                    │    total_score   │
                    │    feedback      │
                    │    strengths     │
                    │    improvements  │
                    │    created_at    │
                    └──────────────────┘
```

---

## Soft Delete 전략

주요 비즈니스 엔티티에 `deleted_at` 컬럼을 추가하여 논리 삭제를 지원한다.

TypeORM의 `@DeleteDateColumn()`을 활용하며, `softDelete()` / `softRemove()` 메서드로 삭제한다.

| 테이블 | Soft Delete 적용 | 근거 |
|--------|:---:|------|
| users | O | 계정 복구, 데이터 보존 |
| resumes | O | 이력서 복구, 연관 데이터 보존 |
| refresh_tokens | X | 만료 시 물리 삭제 |
| question_sets | O | 면접 이력 보존 |
| questions | X | question_sets 삭제 시 CASCADE |
| interview_sessions | O | 면접 이력 보존 |
| interview_answers | X | session 삭제 시 CASCADE |
| evaluations | X | session 삭제 시 CASCADE |
| evaluation_items | X | evaluation 삭제 시 CASCADE |
| reports | O | 리포트 이력 보존 |
| prompt_templates | X | is_active 플래그로 비활성화 |

```sql
-- Soft Delete 적용 테이블의 기본 조회 조건
-- WHERE deleted_at IS NULL
```

---

## 테이블 정의

### users

사용자 정보

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | SERIAL | PK | 사용자 ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 |
| password | VARCHAR(255) | NOT NULL | 암호화된 비밀번호 |
| name | VARCHAR(100) | NOT NULL | 이름 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성일 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 수정일 |
| deleted_at | TIMESTAMP | NULL | 삭제일 (Soft Delete) |

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);
```

---

### refresh_tokens

리프레시 토큰

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | SERIAL | PK | 토큰 ID |
| user_id | INTEGER | FK → users(id), NOT NULL | 소유자 |
| token | VARCHAR(500) | UNIQUE, NOT NULL | 리프레시 토큰 값 |
| expires_at | TIMESTAMP | NOT NULL | 만료 시간 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성일 |

```sql
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### resumes

이력서 정보 (PDF 업로드 + AI 분석 결과)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | SERIAL | PK | 이력서 ID |
| user_id | INTEGER | FK → users(id), NOT NULL | 소유자 |
| title | VARCHAR(255) | NOT NULL | 이력서 제목 |
| file_name | VARCHAR(255) | NOT NULL | 업로드 파일명 |
| file_path | VARCHAR(500) | NOT NULL | 파일 저장 경로 |
| file_size | INTEGER | NOT NULL | 파일 크기 (bytes) |
| raw_text | TEXT | | PDF에서 추출된 원본 텍스트 |
| analysis_status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | 분석 상태 |
| skills | JSONB | NOT NULL, DEFAULT '[]' | 추출된 기술 스택 배열 |
| careers | JSONB | NOT NULL, DEFAULT '[]' | 추출된 경력 배열 |
| projects | JSONB | NOT NULL, DEFAULT '[]' | 추출된 프로젝트 배열 |
| analysis_completed_at | TIMESTAMP | | 분석 완료 시간 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성일 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 수정일 |
| deleted_at | TIMESTAMP | NULL | 삭제일 (Soft Delete) |

```sql
CREATE TABLE resumes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    raw_text TEXT,
    analysis_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    skills JSONB NOT NULL DEFAULT '[]',
    careers JSONB NOT NULL DEFAULT '[]',
    projects JSONB NOT NULL DEFAULT '[]',
    analysis_completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);
```

**analysis_status 상태 전이**

```
pending → analyzing → completed
                   → failed
```

| 상태 | 설명 |
|------|------|
| pending | PDF 업로드 완료, 분석 대기 |
| analyzing | AI 분석 진행 중 |
| completed | 분석 완료, skills/careers/projects 추출됨 |
| failed | 분석 실패 |

**JSONB 구조 - careers**

```json
[
  {
    "company": "ABC Corp",
    "position": "Frontend Developer",
    "startDate": "2023-01",
    "endDate": "2025-12",
    "description": "Vue3 기반 SPA 개발"
  }
]
```

**JSONB 구조 - projects**

```json
[
  {
    "name": "E-Commerce Platform",
    "role": "Frontend Lead",
    "startDate": "2024-03",
    "endDate": "2025-06",
    "description": "Vue3 + TypeScript 기반 이커머스 플랫폼 개발",
    "skills": ["Vue3", "TypeScript", "Pinia"]
  }
]
```

---

### question_sets

질문 세트

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | SERIAL | PK | 질문 세트 ID |
| resume_id | INTEGER | FK → resumes(id), NOT NULL | 기반 이력서 |
| difficulty | VARCHAR(20) | NOT NULL | 난이도 (easy, medium, hard) |
| question_count | SMALLINT | NOT NULL | 질문 수 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성일 |
| deleted_at | TIMESTAMP | NULL | 삭제일 (Soft Delete) |

```sql
CREATE TABLE question_sets (
    id SERIAL PRIMARY KEY,
    resume_id INTEGER NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    difficulty VARCHAR(20) NOT NULL,
    question_count SMALLINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);
```

---

### questions

면접 질문

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | SERIAL | PK | 질문 ID |
| question_set_id | INTEGER | FK → question_sets(id), NOT NULL | 질문 세트 |
| parent_question_id | INTEGER | FK → questions(id), NULL | 원본 질문 (꼬리 질문인 경우) |
| content | TEXT | NOT NULL | 질문 내용 |
| category | VARCHAR(50) | NOT NULL | 카테고리 (framework, language, performance 등) |
| difficulty | VARCHAR(20) | NOT NULL | 난이도 (easy, medium, hard) |
| "order" | SMALLINT | NOT NULL | 질문 순서 |
| question_type | VARCHAR(20) | NOT NULL, DEFAULT 'normal' | 질문 유형 (normal, follow_up) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성일 |

```sql
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    question_set_id INTEGER NOT NULL REFERENCES question_sets(id) ON DELETE CASCADE,
    parent_question_id INTEGER REFERENCES questions(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    "order" SMALLINT NOT NULL,
    question_type VARCHAR(20) NOT NULL DEFAULT 'normal',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**question_type 설명**

| 타입 | 설명 |
|------|------|
| normal | 이력서 기반으로 생성된 일반 질문 |
| follow_up | 사용자 답변 기반으로 생성된 꼬리 질문 |

`question_type = 'follow_up'`인 경우 `parent_question_id`가 NOT NULL이어야 한다 (애플리케이션 레벨 검증).

---

### interview_sessions

면접 세션

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | SERIAL | PK | 세션 ID |
| user_id | INTEGER | FK → users(id), NOT NULL | 면접자 |
| resume_id | INTEGER | FK → resumes(id), NOT NULL | 사용된 이력서 |
| question_set_id | INTEGER | FK → question_sets(id), NOT NULL | 질문 세트 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'in_progress' | 상태 (in_progress, completed, cancelled) |
| total_questions | SMALLINT | NOT NULL | 총 질문 수 |
| difficulty | VARCHAR(20) | NOT NULL | 난이도 |
| started_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 시작 시간 |
| completed_at | TIMESTAMP | | 완료 시간 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성일 |
| deleted_at | TIMESTAMP | NULL | 삭제일 (Soft Delete) |

```sql
CREATE TABLE interview_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id INTEGER NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    question_set_id INTEGER NOT NULL REFERENCES question_sets(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
    total_questions SMALLINT NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);
```

---

### interview_answers

면접 답변

> 기존 `answers` 테이블에서 `interview_answers`로 명칭 변경.
> 면접 세션에 종속된 답변임을 명시적으로 표현한다.

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | SERIAL | PK | 답변 ID |
| session_id | INTEGER | FK → interview_sessions(id), NOT NULL | 면접 세션 |
| question_id | INTEGER | FK → questions(id), NOT NULL | 질문 |
| content | TEXT | NOT NULL | 답변 내용 |
| submitted_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 제출 시간 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성일 |

```sql
CREATE TABLE interview_answers (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (session_id, question_id)
);
```

**명칭 변경 근거**

| 항목 | 설명 |
|------|------|
| 기존 | `answers` — 범용적이어서 도메인 맥락이 불분명 |
| 변경 | `interview_answers` — `interview_sessions`와의 관계가 명확 |
| 규칙 | 부모 테이블명을 접두어로 사용하여 소속 도메인을 표현 |

---

### evaluations

세션 단위 평가 (헤더)

> 기존 단일 테이블을 `evaluations`(세션 단위 헤더) + `evaluation_items`(질문별 상세)로 분리.

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | SERIAL | PK | 평가 ID |
| session_id | INTEGER | FK → interview_sessions(id), UNIQUE, NOT NULL | 면접 세션 |
| overall_score | SMALLINT | NOT NULL | 종합 점수 (0-100) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성일 |

```sql
CREATE TABLE evaluations (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL UNIQUE REFERENCES interview_sessions(id) ON DELETE CASCADE,
    overall_score SMALLINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### evaluation_items

질문별 평가 상세

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | SERIAL | PK | 평가 항목 ID |
| evaluation_id | INTEGER | FK → evaluations(id), NOT NULL | 세션 평가 |
| question_id | INTEGER | FK → questions(id), NOT NULL | 질문 |
| answer_id | INTEGER | FK → interview_answers(id), NOT NULL | 답변 |
| scores | JSONB | NOT NULL | 항목별 점수 |
| total_score | SMALLINT | NOT NULL | 종합 점수 (0-100) |
| feedback | TEXT | NOT NULL | 피드백 |
| strengths | JSONB | NOT NULL, DEFAULT '[]' | 강점 |
| improvements | JSONB | NOT NULL, DEFAULT '[]' | 개선점 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성일 |

```sql
CREATE TABLE evaluation_items (
    id SERIAL PRIMARY KEY,
    evaluation_id INTEGER NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answer_id INTEGER NOT NULL REFERENCES interview_answers(id) ON DELETE CASCADE,
    scores JSONB NOT NULL,
    total_score SMALLINT NOT NULL,
    feedback TEXT NOT NULL,
    strengths JSONB NOT NULL DEFAULT '[]',
    improvements JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (evaluation_id, question_id)
);
```

**분리 근거**

| 항목 | 기존 (단일) | 변경 (분리) |
|------|-----------|-----------|
| 구조 | 질문별 평가가 개별 행, session_id 중복 | evaluations(헤더) + evaluation_items(상세) |
| overall_score | 매 행에 중복 저장 또는 별도 계산 | evaluations 테이블에 1회 저장 |
| 조회 | 세션 단위 집계 시 GROUP BY 필요 | evaluations 직접 조회 |
| 확장성 | 세션 레벨 메타 정보 추가 어려움 | evaluations에 자유롭게 추가 가능 |

**JSONB 구조 - scores**

```json
{
  "accuracy": 80,
  "depth": 70,
  "structure": 75,
  "communication": 80
}
```

---

### reports

면접 리포트

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | SERIAL | PK | 리포트 ID |
| session_id | INTEGER | FK → interview_sessions(id), UNIQUE, NOT NULL | 면접 세션 |
| overall_score | SMALLINT | NOT NULL | 종합 점수 (0-100) |
| grade | VARCHAR(5) | NOT NULL | 등급 (A+, A, B+, B, C+, C, D, F) |
| summary | TEXT | NOT NULL | 종합 평가 요약 |
| strengths | JSONB | NOT NULL, DEFAULT '[]' | 강점 목록 |
| improvements | JSONB | NOT NULL, DEFAULT '[]' | 개선점 목록 |
| category_scores | JSONB | NOT NULL, DEFAULT '[]' | 카테고리별 점수 |
| metadata | JSONB | NOT NULL, DEFAULT '{}' | 메타 정보 (소요시간 등) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성일 |
| deleted_at | TIMESTAMP | NULL | 삭제일 (Soft Delete) |

```sql
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL UNIQUE REFERENCES interview_sessions(id) ON DELETE CASCADE,
    overall_score SMALLINT NOT NULL,
    grade VARCHAR(5) NOT NULL,
    summary TEXT NOT NULL,
    strengths JSONB NOT NULL DEFAULT '[]',
    improvements JSONB NOT NULL DEFAULT '[]',
    category_scores JSONB NOT NULL DEFAULT '[]',
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);
```

---

### prompt_templates

AI 프롬프트 템플릿 버전 관리

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | SERIAL | PK | 템플릿 ID |
| name | VARCHAR(100) | NOT NULL | 템플릿 이름 |
| type | VARCHAR(50) | NOT NULL | 프롬프트 유형 |
| system_prompt | TEXT | NOT NULL | System Prompt 내용 |
| user_prompt_template | TEXT | NOT NULL | User Prompt 템플릿 (변수 포함) |
| version | SMALLINT | NOT NULL, DEFAULT 1 | 버전 번호 |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | 활성 여부 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성일 |

```sql
CREATE TABLE prompt_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    system_prompt TEXT NOT NULL,
    user_prompt_template TEXT NOT NULL,
    version SMALLINT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (type, version)
);
```

**type 목록**

| type | 설명 | 변수 |
|------|------|------|
| resume_analysis | 이력서 분석 | {resumeText} |
| question_generation | 질문 생성 | {skills}, {careers}, {projects}, {difficulty}, {count} |
| follow_up_question | 꼬리 질문 생성 | {originalQuestion}, {answer} |
| answer_evaluation | 답변 평가 | {question}, {answer} |
| report_generation | 리포트 생성 | {difficulty}, {totalQuestions}, {duration}, {evaluations} |

**버전 관리 규칙**

- 동일 `type`에 대해 `is_active = TRUE`인 행은 최대 1개
- 새 버전 등록 시 기존 활성 버전을 `is_active = FALSE`로 변경
- 애플리케이션에서는 `WHERE type = ? AND is_active = TRUE`로 조회

---

## PK / FK 관계 요약

| 테이블 | PK | FK | 관계 |
|--------|----|----|------|
| users | id | - | - |
| refresh_tokens | id | user_id → users(id) | users 1:N refresh_tokens |
| resumes | id | user_id → users(id) | users 1:N resumes |
| question_sets | id | resume_id → resumes(id) | resumes 1:N question_sets |
| questions | id | question_set_id → question_sets(id), parent_question_id → questions(id) | question_sets 1:N questions, questions 1:N questions (self) |
| interview_sessions | id | user_id → users(id), resume_id → resumes(id), question_set_id → question_sets(id) | users 1:N sessions, resumes 1:N sessions, question_sets 1:N sessions |
| interview_answers | id | session_id → interview_sessions(id), question_id → questions(id) | sessions 1:N answers, questions 1:N answers |
| evaluations | id | session_id → interview_sessions(id) | sessions 1:1 evaluations |
| evaluation_items | id | evaluation_id → evaluations(id), question_id → questions(id), answer_id → interview_answers(id) | evaluations 1:N items |
| reports | id | session_id → interview_sessions(id) | sessions 1:1 reports |
| prompt_templates | id | - | 독립 테이블 |

---

## 인덱스 전략

### 조회 성능 인덱스

```sql
-- users: 로그인 시 이메일 조회
-- email은 UNIQUE 제약조건으로 자동 인덱스 생성됨

-- users: Soft Delete 필터링
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- refresh_tokens: 사용자별 토큰 조회
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- refresh_tokens: 토큰 값 조회
-- token은 UNIQUE 제약조건으로 자동 인덱스 생성됨

-- refresh_tokens: 만료 토큰 정리
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- resumes: 사용자별 이력서 목록 조회
CREATE INDEX idx_resumes_user_id ON resumes(user_id) WHERE deleted_at IS NULL;

-- resumes: 분석 상태별 필터링
CREATE INDEX idx_resumes_analysis_status ON resumes(user_id, analysis_status) WHERE deleted_at IS NULL;

-- question_sets: 이력서 기반 질문 세트 조회
CREATE INDEX idx_question_sets_resume_id ON question_sets(resume_id) WHERE deleted_at IS NULL;

-- questions: 질문 세트 단위 조회
CREATE INDEX idx_questions_question_set_id ON questions(question_set_id);

-- questions: 꼬리 질문 조회 (부모 질문 기준)
CREATE INDEX idx_questions_parent_question_id ON questions(parent_question_id) WHERE parent_question_id IS NOT NULL;

-- questions: 질문 유형별 필터링
CREATE INDEX idx_questions_type ON questions(question_set_id, question_type);

-- interview_sessions: 사용자별 면접 이력 조회
CREATE INDEX idx_interview_sessions_user_id ON interview_sessions(user_id) WHERE deleted_at IS NULL;

-- interview_sessions: 상태별 필터링
CREATE INDEX idx_interview_sessions_status ON interview_sessions(user_id, status) WHERE deleted_at IS NULL;

-- interview_sessions: 질문 세트 기반 조회
CREATE INDEX idx_interview_sessions_question_set_id ON interview_sessions(question_set_id);

-- interview_answers: 세션별 답변 조회
CREATE INDEX idx_interview_answers_session_id ON interview_answers(session_id);

-- evaluation_items: 평가별 항목 조회
CREATE INDEX idx_evaluation_items_evaluation_id ON evaluation_items(evaluation_id);

-- prompt_templates: 활성 프롬프트 조회
CREATE INDEX idx_prompt_templates_active ON prompt_templates(type, is_active) WHERE is_active = TRUE;
```

### JSONB 인덱스

```sql
-- resumes: 기술 스택 기반 검색 (향후 확장 시)
CREATE INDEX idx_resumes_skills ON resumes USING GIN (skills);
```

### 복합 유니크 제약조건 (자동 인덱스)

```sql
-- interview_answers: 세션 내 질문당 답변 1개
-- UNIQUE (session_id, question_id) → 자동 인덱스

-- evaluation_items: 평가 내 질문당 항목 1개
-- UNIQUE (evaluation_id, question_id) → 자동 인덱스

-- evaluations: 세션당 평가 1개
-- UNIQUE (session_id) → 자동 인덱스

-- reports: 세션당 리포트 1개
-- UNIQUE (session_id) → 자동 인덱스

-- prompt_templates: 타입당 버전 고유
-- UNIQUE (type, version) → 자동 인덱스
```

### 인덱스 설계 근거

| 인덱스 | 대상 쿼리 | 근거 |
|--------|----------|------|
| idx_users_deleted_at | `WHERE deleted_at IS NULL` | Soft Delete 기본 필터 (부분 인덱스) |
| idx_refresh_tokens_user_id | `WHERE user_id = ?` | 로그아웃 시 사용자 토큰 전체 삭제 |
| idx_refresh_tokens_expires_at | `WHERE expires_at < NOW()` | 만료 토큰 배치 정리 |
| idx_resumes_user_id | `WHERE user_id = ? AND deleted_at IS NULL` | 사용자별 이력서 목록 (부분 인덱스) |
| idx_resumes_analysis_status | `WHERE user_id = ? AND analysis_status = ?` | 분석 완료된 이력서만 필터링 |
| idx_question_sets_resume_id | `WHERE resume_id = ?` | 이력서 기반 질문 세트 목록 조회 |
| idx_questions_question_set_id | `WHERE question_set_id = ?` | 면접 시작 시 질문 세트 전체 로딩 |
| idx_questions_parent_question_id | `WHERE parent_question_id = ?` | 꼬리 질문 트리 조회 (부분 인덱스) |
| idx_questions_type | `WHERE question_set_id = ? AND question_type = ?` | 일반/꼬리 질문 분리 조회 |
| idx_interview_sessions_user_id | `WHERE user_id = ?` | 면접 이력 페이지 조회 |
| idx_interview_sessions_status | `WHERE user_id = ? AND status = ?` | 진행 중인 면접 확인 |
| idx_interview_sessions_question_set_id | `WHERE question_set_id = ?` | 질문 세트 기반 세션 조회 |
| idx_interview_answers_session_id | `WHERE session_id = ?` | 세션 답변 전체 로딩 (평가 시) |
| idx_evaluation_items_evaluation_id | `WHERE evaluation_id = ?` | 평가 상세 항목 로딩 |
| idx_prompt_templates_active | `WHERE type = ? AND is_active = TRUE` | 활성 프롬프트 조회 (부분 인덱스) |
| idx_resumes_skills (GIN) | `WHERE skills @> '["Vue3"]'` | 기술 스택 기반 필터링 (확장용) |
