# AI Rules

## 프로젝트 정보

- **프로젝트명**: InterviewMate
- **설명**: AI 기반 기술 면접 시뮬레이터
  - PDF 이력서 업로드 및 AI 분석
  - 이력서 기반 기술 스택, 프로젝트, 경력 자동 추출
  - 예상 면접 질문 생성
  - 답변 기반 꼬리 질문(Follow-up Question) 생성
  - 답변 평가
  - 면접 결과 리포트 제공

### 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Vue3, TypeScript, Vite, Pinia, Element Plus |
| Backend | NestJS, PostgreSQL, TypeORM |
| AI | OpenAI API |

---

## 1. 프로젝트 목표

- 사용자의 이력서를 기반으로 맞춤형 기술 면접을 시뮬레이션한다
- AI가 이력서에서 기술 스택을 추출하고 난이도별 면접 질문을 생성한다
- 답변에 대한 꼬리 질문으로 실제 면접과 유사한 경험을 제공한다
- AI가 답변을 항목별로 평가하고 구체적인 피드백을 제공한다
- 면접 결과를 종합 리포트로 제공하여 강점과 약점을 파악할 수 있게 한다

---

## 2. 개발 원칙

- Feature 기반 아키텍처를 유지한다 (Frontend)
- Module 기반 아키텍처를 유지한다 (Backend)
- 각 Feature/Module은 독립적으로 동작하며 직접 참조하지 않는다
- shared 영역의 수정은 최소화한다
- 기존 코드 스타일과 컨벤션을 따른다
- 추측으로 구현하지 않는다. 확인되지 않은 사항은 질문한다
- 단순하고 명확한 코드를 우선한다

---

## 3. 폴더 구조 규칙

### Frontend (Feature 기반)

```
src/
├── app/                    # 앱 초기화, 라우터, 전역 설정
├── shared/                 # 공통 유틸, 타입, API 클라이언트, 상수
├── features/               # 도메인별 기능 단위
│   ├── auth/
│   ├── resume/
│   ├── question/
│   ├── interview/
│   ├── evaluation/
│   └── report/
├── pages/                  # 라우트 단위 페이지 컴포넌트
└── widgets/                # 페이지에 조합되는 독립 UI 블록
```

**Feature 내부 구조**

```
features/{feature-name}/
├── api/                    # API 호출 함수
├── model/                  # 타입, 인터페이스, store
├── ui/                     # 컴포넌트
└── index.ts                # public API (외부 노출 인터페이스)
```

### Backend (Module 기반)

```
src/
├── modules/                # 도메인별 모듈
│   ├── auth/
│   ├── resume/
│   ├── question/
│   ├── interview/
│   ├── evaluation/
│   └── report/
├── common/                 # 공통 데코레이터, 가드, 필터, 인터셉터
└── config/                 # 환경 설정
```

**Module 내부 구조**

```
modules/{module-name}/
├── dto/                    # Request/Response DTO
├── entities/               # TypeORM 엔티티
├── {name}.controller.ts
├── {name}.service.ts
├── {name}.module.ts
└── {name}.repository.ts
```

---

## 4. 파일 생성 규칙

- 새 파일은 해당 Feature 또는 Module 디렉토리 내에 생성한다
- Feature/Module 경계를 넘는 파일을 생성하지 않는다
- 공통 파일은 shared(Frontend) 또는 common(Backend)에 생성한다
- 파일명은 kebab-case를 사용한다
- 테스트 파일은 대상 파일과 같은 디렉토리에 `*.spec.ts`로 생성한다
- index.ts를 통해 외부에 노출할 인터페이스만 export 한다

---

## 5. 코드 수정 규칙

- 요청된 파일만 수정한다
- 요청하지 않은 리팩토링을 수행하지 않는다
- 기존 코드 스타일(네이밍, 포맷, 패턴)을 유지한다
- shared/common 영역 수정이 필요한 경우 사전에 알리고 승인을 받는다
- module 간, feature 간 직접 import를 하지 않는다
- 수정 시 기존 동작에 영향을 주지 않는지 확인한다

---

## 6. 구현 절차

모든 구현 작업은 다음 절차를 따른다.

### Step 1. 분석

- 요청 사항을 분석하고 영향 범위를 설명한다
- 불명확한 요구사항은 질문하여 확인한다

### Step 2. 계획 제안

- 생성할 파일 목록을 제안한다
- 수정할 파일 목록을 제안한다
- 영향받는 Feature/Module을 명시한다
- 대규모 변경의 경우 단계별 계획을 먼저 제안한다

### Step 3. 승인

- 사용자의 승인을 받은 후에만 코드를 작성한다
- 신규 라이브러리가 필요한 경우 별도로 승인을 받는다

### Step 4. 구현

- 승인된 범위 내에서만 코드를 작성한다
- Feature/Module 아키텍처를 준수한다

### Step 5. 완료 보고

- 변경 사항을 요약한다
- 생성된 파일, 수정된 파일, 삭제된 파일을 명시한다
- 추가 작업이 필요한 경우 안내한다

---

## 7. 금지 사항

- 승인 없이 코드를 작성하지 않는다
- 요청하지 않은 파일을 수정하지 않는다
- 요청하지 않은 리팩토링을 수행하지 않는다
- 추측으로 구현하지 않는다
- 신규 라이브러리를 승인 없이 추가하지 않는다
- module 간 직접 참조(import)를 하지 않는다
- feature 간 직접 참조(import)를 하지 않는다
- shared/common 영역을 승인 없이 수정하지 않는다
- 기존 코드 스타일을 임의로 변경하지 않는다
- 확인되지 않은 API나 동작을 가정하여 구현하지 않는다

---

## 8. 응답 형식

### 구현 요청 시

```
## 분석
- 요청 사항 요약
- 영향 범위

## 변경 계획
### 생성 파일
- path/to/new-file.ts — 설명

### 수정 파일
- path/to/existing-file.ts — 변경 내용

### 영향 범위
- 영향받는 Feature/Module 목록

위 계획으로 진행할까요?
```

### 구현 완료 시

```
## 변경 사항 요약

### 생성된 파일
- path/to/new-file.ts — 설명

### 수정된 파일
- path/to/existing-file.ts — 변경 내용

### 참고 사항
- 추가 작업이 필요한 경우 안내
```
