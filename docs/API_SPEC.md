# API Specification

Base URL: `/api/v1`

---

## Auth

### POST /auth/signup

회원가입

**Request**

```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "홍길동"
}
```

**Response**

`201 Created`

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "홍길동",
  "createdAt": "2026-06-18T09:00:00.000Z"
}
```

| Status Code | 설명 |
|-------------|------|
| 201 | 회원가입 성공 |
| 400 | 유효성 검증 실패 (이메일 형식, 비밀번호 규칙 등) |
| 409 | 이미 존재하는 이메일 |

---

### POST /auth/login

로그인

**Request**

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response**

`200 OK`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동"
  }
}
```

| Status Code | 설명 |
|-------------|------|
| 200 | 로그인 성공 |
| 400 | 유효성 검증 실패 |
| 401 | 이메일 또는 비밀번호 불일치 |

---

## Resume

> 이하 모든 API는 `Authorization: Bearer {accessToken}` 헤더 필요

### POST /resumes/upload

PDF 이력서 업로드

**Request**

`Content-Type: multipart/form-data`

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| file | File (PDF) | O | PDF 이력서 파일 (최대 10MB) |
| title | string | X | 이력서 제목 (기본값: 파일명) |

**Response**

`201 Created`

```json
{
  "id": 1,
  "title": "프론트엔드 개발자 이력서",
  "fileName": "resume_2026.pdf",
  "fileSize": 524288,
  "mimeType": "application/pdf",
  "status": "uploaded",
  "createdAt": "2026-06-18T09:00:00.000Z"
}
```

| Status Code | 설명 |
|-------------|------|
| 201 | 업로드 성공 |
| 400 | 유효성 검증 실패 (파일 형식, 크기 등) |
| 401 | 인증 실패 |
| 415 | 지원하지 않는 파일 형식 (PDF만 허용) |

---

### POST /resumes/:id/analyze

업로드된 PDF 이력서 AI 분석

**Request**

PathParam: `id` (number) - 이력서 ID

**Response**

`200 OK`

```json
{
  "id": 1,
  "title": "프론트엔드 개발자 이력서",
  "status": "analyzed",
  "skills": ["Vue3", "TypeScript", "React", "JavaScript", "HTML/CSS"],
  "careers": [
    {
      "company": "ABC Corp",
      "position": "Frontend Developer",
      "startDate": "2023-01",
      "endDate": "2025-12",
      "description": "Vue3 기반 SPA 개발"
    }
  ],
  "projects": [
    {
      "name": "E-Commerce Platform",
      "role": "Frontend Lead",
      "startDate": "2024-03",
      "endDate": "2025-06",
      "description": "Vue3 + TypeScript 기반 이커머스 플랫폼 개발",
      "skills": ["Vue3", "TypeScript", "Pinia"]
    }
  ],
  "analyzedAt": "2026-06-18T09:01:00.000Z"
}
```

| Status Code | 설명 |
|-------------|------|
| 200 | 분석 성공 |
| 401 | 인증 실패 |
| 403 | 본인 이력서가 아님 |
| 404 | 이력서 없음 |
| 409 | 이미 분석 완료된 이력서 |
| 422 | PDF 분석 실패 (텍스트 추출 불가 등) |

---

### GET /resumes/:id

이력서 조회

**Request**

PathParam: `id` (number) - 이력서 ID

**Response**

`200 OK`

```json
{
  "id": 1,
  "title": "프론트엔드 개발자 이력서",
  "fileName": "resume_2026.pdf",
  "fileSize": 524288,
  "mimeType": "application/pdf",
  "status": "analyzed",
  "skills": ["Vue3", "TypeScript", "React"],
  "careers": [
    {
      "company": "ABC Corp",
      "position": "Frontend Developer",
      "startDate": "2023-01",
      "endDate": "2025-12",
      "description": "Vue3 기반 SPA 개발"
    }
  ],
  "projects": [
    {
      "name": "E-Commerce Platform",
      "role": "Frontend Lead",
      "startDate": "2024-03",
      "endDate": "2025-06",
      "description": "Vue3 + TypeScript 기반 이커머스 플랫폼 개발",
      "skills": ["Vue3", "TypeScript", "Pinia"]
    }
  ],
  "analyzedAt": "2026-06-18T09:01:00.000Z",
  "createdAt": "2026-06-18T09:00:00.000Z",
  "updatedAt": "2026-06-18T09:01:00.000Z"
}
```

| Status Code | 설명 |
|-------------|------|
| 200 | 조회 성공 |
| 401 | 인증 실패 |
| 403 | 본인 이력서가 아님 |
| 404 | 이력서 없음 |

---

## Question

### POST /questions/generate

이력서 기반 질문 생성

**Request**

```json
{
  "resumeId": 1,
  "count": 10,
  "difficulty": "medium"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| resumeId | number | O | 이력서 ID (분석 완료 상태여야 함) |
| count | number | X | 생성할 질문 수 (기본값: 10) |
| difficulty | string | X | easy, medium, hard (기본값: medium) |

**Response**

`201 Created`

```json
{
  "id": 1,
  "resumeId": 1,
  "difficulty": "medium",
  "questions": [
    {
      "id": 1,
      "content": "Vue3의 Composition API와 Options API의 차이점을 설명해주세요.",
      "category": "framework",
      "difficulty": "medium",
      "order": 1,
      "isFollowUp": false,
      "parentQuestionId": null
    },
    {
      "id": 2,
      "content": "TypeScript에서 제네릭을 활용한 경험이 있다면 설명해주세요.",
      "category": "language",
      "difficulty": "medium",
      "order": 2,
      "isFollowUp": false,
      "parentQuestionId": null
    }
  ],
  "createdAt": "2026-06-18T09:00:00.000Z"
}
```

| Status Code | 설명 |
|-------------|------|
| 201 | 질문 생성 성공 |
| 400 | 유효성 검증 실패 |
| 401 | 인증 실패 |
| 404 | 이력서 없음 |
| 409 | 이력서가 분석되지 않은 상태 |

---

### GET /question-sets/:id

질문 세트 조회

**Request**

PathParam: `id` (number) - 질문 세트 ID

**Response**

`200 OK`

```json
{
  "id": 1,
  "resumeId": 1,
  "difficulty": "medium",
  "questionCount": 10,
  "questions": [
    {
      "id": 1,
      "content": "Vue3의 Composition API와 Options API의 차이점을 설명해주세요.",
      "category": "framework",
      "difficulty": "medium",
      "order": 1,
      "isFollowUp": false,
      "parentQuestionId": null
    },
    {
      "id": 2,
      "content": "TypeScript에서 제네릭을 활용한 경험이 있다면 설명해주세요.",
      "category": "language",
      "difficulty": "medium",
      "order": 2,
      "isFollowUp": false,
      "parentQuestionId": null
    }
  ],
  "createdAt": "2026-06-18T09:00:00.000Z"
}
```

| Status Code | 설명 |
|-------------|------|
| 200 | 조회 성공 |
| 401 | 인증 실패 |
| 403 | 본인 질문 세트가 아님 |
| 404 | 질문 세트 없음 |

---

### POST /questions/follow-up

꼬리 질문 생성

**Request**

```json
{
  "questionId": 1,
  "answer": "Composition API는 setup 함수 내에서 반응형 상태와 로직을 구성하는 방식이고, Options API는 data, methods, computed 등의 옵션 객체로 컴포넌트를 정의하는 방식입니다."
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| questionId | number | O | 원본 질문 ID |
| answer | string | O | 사용자 답변 내용 |

**Response**

`201 Created`

```json
{
  "questionId": 3,
  "parentQuestionId": 1,
  "followUpQuestion": "Composition API에서 반응형 상태를 관리할 때 ref와 reactive의 차이점은 무엇이고, 각각 어떤 상황에서 사용하는 것이 적절한가요?",
  "category": "framework",
  "difficulty": "medium",
  "isFollowUp": true
}
```

| Status Code | 설명 |
|-------------|------|
| 201 | 꼬리 질문 생성 성공 |
| 400 | 유효성 검증 실패 (빈 답변 등) |
| 401 | 인증 실패 |
| 404 | 원본 질문 없음 |

---

## Interview

### POST /interviews

면접 시작

**Request**

```json
{
  "questionSetId": 1
}
```

**Response**

`201 Created`

```json
{
  "id": 1,
  "questionSetId": 1,
  "status": "in_progress",
  "currentOrder": 1,
  "totalQuestions": 10,
  "currentQuestion": {
    "id": 1,
    "content": "Vue3의 Composition API와 Options API의 차이점을 설명해주세요.",
    "category": "framework",
    "difficulty": "medium",
    "order": 1
  },
  "startedAt": "2026-06-18T09:00:00.000Z"
}
```

| Status Code | 설명 |
|-------------|------|
| 201 | 면접 세션 생성 성공 |
| 400 | 유효성 검증 실패 |
| 401 | 인증 실패 |
| 404 | 질문 세트 없음 |

---

### POST /interviews/:id/answers

답변 제출

**Request**

PathParam: `id` (number) - 면접 세션 ID

```json
{
  "questionId": 1,
  "content": "Composition API는 setup 함수 내에서 반응형 상태와 로직을 구성하는 방식이고, Options API는 data, methods, computed 등의 옵션 객체로 컴포넌트를 정의하는 방식입니다..."
}
```

**Response**

`201 Created`

```json
{
  "id": 1,
  "sessionId": 1,
  "questionId": 1,
  "content": "Composition API는 setup 함수 내에서 반응형 상태와 로직을 구성하는 방식이고...",
  "nextQuestion": {
    "id": 2,
    "content": "TypeScript에서 제네릭을 활용한 경험이 있다면 설명해주세요.",
    "category": "language",
    "difficulty": "medium",
    "order": 2
  },
  "progress": {
    "current": 2,
    "total": 10
  },
  "submittedAt": "2026-06-18T09:05:00.000Z"
}
```

마지막 질문 답변 시 `nextQuestion`은 `null`이며 세션 상태가 `completed`로 변경된다.

```json
{
  "id": 10,
  "sessionId": 1,
  "questionId": 10,
  "content": "...",
  "nextQuestion": null,
  "progress": {
    "current": 10,
    "total": 10
  },
  "sessionStatus": "completed",
  "submittedAt": "2026-06-18T09:30:00.000Z"
}
```

| Status Code | 설명 |
|-------------|------|
| 201 | 답변 제출 성공 |
| 400 | 유효성 검증 실패 (빈 답변, 잘못된 questionId 등) |
| 401 | 인증 실패 |
| 404 | 세션 또는 질문 없음 |
| 409 | 이미 완료된 세션 또는 이미 제출된 답변 |

---

## Evaluation

### POST /evaluations

면접 세션 평가 생성

**Request**

```json
{
  "sessionId": 1
}
```

**Response**

`201 Created`

```json
{
  "id": 1,
  "sessionId": 1,
  "overallScore": 75,
  "evaluations": [
    {
      "questionId": 1,
      "question": "Vue3의 Composition API와 Options API의 차이점을 설명해주세요.",
      "scores": {
        "accuracy": 80,
        "depth": 70,
        "structure": 75,
        "communication": 80
      },
      "totalScore": 76,
      "feedback": "핵심 차이점을 정확히 설명했습니다. 실제 사용 사례나 성능 차이에 대한 언급이 추가되면 더 좋겠습니다.",
      "strengths": ["핵심 개념 이해도 높음", "명확한 비교 구조"],
      "improvements": ["실무 사례 보강 필요", "성능 관점 분석 추가"]
    }
  ],
  "createdAt": "2026-06-18T09:35:00.000Z"
}
```

| 평가 항목 | 설명 | 배점 |
|----------|------|------|
| accuracy | 답변의 기술적 정확성 | 0-100 |
| depth | 답변의 깊이와 구체성 | 0-100 |
| structure | 답변의 논리적 구조 | 0-100 |
| communication | 전달력과 표현력 | 0-100 |

| Status Code | 설명 |
|-------------|------|
| 201 | 평가 생성 성공 |
| 400 | 유효성 검증 실패 |
| 401 | 인증 실패 |
| 404 | 세션 없음 |
| 409 | 세션이 완료되지 않았거나 이미 평가가 존재함 |

---

### GET /evaluations/:sessionId

면접 세션 평가 조회

**Request**

PathParam: `sessionId` (number) - 면접 세션 ID

**Response**

`200 OK`

```json
{
  "id": 1,
  "sessionId": 1,
  "overallScore": 75,
  "evaluations": [
    {
      "questionId": 1,
      "question": "Vue3의 Composition API와 Options API의 차이점을 설명해주세요.",
      "scores": {
        "accuracy": 80,
        "depth": 70,
        "structure": 75,
        "communication": 80
      },
      "totalScore": 76,
      "feedback": "핵심 차이점을 정확히 설명했습니다. 실제 사용 사례나 성능 차이에 대한 언급이 추가되면 더 좋겠습니다.",
      "strengths": ["핵심 개념 이해도 높음", "명확한 비교 구조"],
      "improvements": ["실무 사례 보강 필요", "성능 관점 분석 추가"]
    }
  ],
  "createdAt": "2026-06-18T09:35:00.000Z"
}
```

| Status Code | 설명 |
|-------------|------|
| 200 | 조회 성공 |
| 401 | 인증 실패 |
| 403 | 본인 세션이 아님 |
| 404 | 세션 없음 또는 평가 미완료 |

---

## Report

### GET /reports

사용자 리포트 목록 조회

**Request**

QueryParam:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| page | number | X | 페이지 번호 (기본값: 1) |
| limit | number | X | 페이지당 항목 수 (기본값: 10) |

**Response**

`200 OK`

```json
{
  "items": [
    {
      "id": 1,
      "sessionId": 1,
      "overallScore": 75,
      "grade": "B+",
      "summary": "전반적으로 프론트엔드 핵심 개념에 대한 이해도가 높습니다.",
      "metadata": {
        "totalQuestions": 10,
        "duration": 1800,
        "difficulty": "medium",
        "completedAt": "2026-06-18T09:30:00.000Z"
      },
      "createdAt": "2026-06-18T09:35:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 5,
    "totalPages": 1
  }
}
```

| Status Code | 설명 |
|-------------|------|
| 200 | 조회 성공 |
| 401 | 인증 실패 |

---

### GET /reports/:sessionId

면접 리포트 상세 조회

**Request**

PathParam: `sessionId` (number) - 면접 세션 ID

**Response**

`200 OK`

```json
{
  "id": 1,
  "sessionId": 1,
  "overallScore": 75,
  "grade": "B+",
  "summary": "전반적으로 프론트엔드 핵심 개념에 대한 이해도가 높습니다. 프레임워크 관련 질문에서 강점을 보였으며, 성능 최적화 영역에서 보완이 필요합니다.",
  "categoryScores": [
    { "category": "framework", "score": 82, "questionCount": 4 },
    { "category": "language", "score": 78, "questionCount": 3 },
    { "category": "performance", "score": 60, "questionCount": 2 },
    { "category": "architecture", "score": 72, "questionCount": 1 }
  ],
  "strengths": [
    "Vue3 Composition API에 대한 깊은 이해",
    "TypeScript 타입 시스템 활용 능력",
    "명확하고 구조적인 답변 전달력"
  ],
  "improvements": [
    "웹 성능 최적화 전략에 대한 학습 필요",
    "대규모 애플리케이션 아키텍처 설계 경험 보강",
    "브라우저 렌더링 파이프라인 심화 학습"
  ],
  "questionResults": [
    {
      "questionId": 1,
      "content": "Vue3의 Composition API와 Options API의 차이점을 설명해주세요.",
      "category": "framework",
      "score": 76,
      "grade": "B"
    }
  ],
  "metadata": {
    "totalQuestions": 10,
    "duration": 1800,
    "difficulty": "medium",
    "completedAt": "2026-06-18T09:30:00.000Z"
  },
  "createdAt": "2026-06-18T09:35:00.000Z"
}
```

| Status Code | 설명 |
|-------------|------|
| 200 | 조회 성공 |
| 401 | 인증 실패 |
| 403 | 본인 리포트가 아님 |
| 404 | 세션 없음 또는 리포트 미생성 |

---

## 공통

### 인증 헤더

```
Authorization: Bearer {accessToken}
```

### 에러 응답 형식

```json
{
  "statusCode": 400,
  "message": "유효성 검증에 실패했습니다.",
  "errors": [
    {
      "field": "email",
      "message": "올바른 이메일 형식이 아닙니다."
    }
  ]
}
```

### 공통 Status Code

| Status Code | 설명 |
|-------------|------|
| 400 | 잘못된 요청 (유효성 검증 실패) |
| 401 | 인증 실패 (토큰 없음 또는 만료) |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 409 | 충돌 (중복 데이터, 잘못된 상태 전이 등) |
| 415 | 지원하지 않는 미디어 타입 |
| 422 | 처리 불가 (파싱 실패 등) |
| 500 | 서버 내부 오류 |
