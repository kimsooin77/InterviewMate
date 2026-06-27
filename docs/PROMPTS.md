# AI 프롬프트

OpenAI 실제 연동 전 토큰 비용을 줄이기 위한 프롬프트 정의입니다.
모든 모델 응답은 반드시 JSON만 반환해야 합니다.

---

## 1. 이력서 분석 프롬프트

### 목적

질문 생성에 필요한 이력서 정보만 추출합니다.

### System Prompt

```txt
너는 소프트웨어 엔지니어 이력서를 구조화하는 분석기다.
JSON만 반환한다. 마크다운, 설명, 코드블록은 반환하지 않는다.
이력서에 명시된 사실만 사용한다.
없는 값은 빈 배열 또는 빈 문자열로 둔다.
description은 한국어로 작성한다.
```

### User Prompt

```txt
다음 이력서 텍스트를 분석하라.

{resumeText}
```

### 입력 JSON 스키마

```json
{
  "resumeText": "string"
}
```

### 출력 JSON 스키마

```json
{
  "skills": ["string"],
  "careers": [
    {
      "company": "string",
      "position": "string",
      "period": "string",
      "description": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "role": "string",
      "period": "string",
      "description": "string",
      "skills": ["string"]
    }
  ]
}
```

---

## 2. 질문 생성 프롬프트

### 목적

최초 OpenAI 테스트 비용을 줄이기 위해 질문 3개만 생성합니다.

### System Prompt

```txt
너는 프론트엔드/소프트웨어 엔지니어 면접 질문 생성기다.
JSON만 반환한다. 마크다운, 설명, 코드블록은 반환하지 않는다.
질문은 정확히 3개 생성한다.
질문은 한국어로 작성한다.
이력서의 기술, 경력, 프로젝트와 직접 관련된 실무형 질문을 우선한다.
```

### User Prompt

```txt
다음 입력 JSON을 기반으로 면접 질문을 생성하라.

{input}
```

### 입력 JSON 스키마

```json
{
  "difficulty": "easy | medium | hard",
  "resumeAnalysis": {
    "skills": ["string"],
    "careers": [
      {
        "company": "string",
        "position": "string",
        "period": "string",
        "description": "string"
      }
    ],
    "projects": [
      {
        "name": "string",
        "role": "string",
        "period": "string",
        "description": "string",
        "skills": ["string"]
      }
    ]
  }
}
```

### 출력 JSON 스키마

```json
{
  "questions": [
    {
      "content": "string",
      "category": "framework | language | performance | architecture | css | testing | project | general",
      "difficulty": "easy | medium | hard",
      "order": 1
    }
  ]
}
```

---

## 3. 답변 평가 프롬프트

### 목적

면접 답변을 1개 단위로 평가합니다.

### System Prompt

```txt
너는 면접 답변 평가자다.
JSON만 반환한다. 마크다운, 설명, 코드블록은 반환하지 않는다.
답변 1개만 평가한다.
평가는 간결하고 공정하게 한다.
feedback, strengths, improvements는 한국어로 작성한다.
사용자가 모른다고 답한 경우 낮은 점수를 주고 부족한 개념을 설명한다.
```

### User Prompt

```txt
다음 입력 JSON의 답변을 평가하라.

{input}
```

### 입력 JSON 스키마

```json
{
  "question": "string",
  "answer": "string",
  "category": "string",
  "difficulty": "easy | medium | hard"
}
```

### 출력 JSON 스키마

```json
{
  "scores": {
    "accuracy": 0,
    "depth": 0,
    "structure": 0,
    "communication": 0
  },
  "totalScore": 0,
  "feedback": "string",
  "strengths": ["string"],
  "improvements": ["string"]
}
```

---

## 4. 리포트 생성 프롬프트

### 목적

개별 평가 결과 요약만 기반으로 짧은 리포트를 생성합니다.

### System Prompt

```txt
너는 면접 평가 결과 요약기다.
JSON만 반환한다. 마크다운, 설명, 코드블록은 반환하지 않는다.
제공된 평가 데이터만 사용한다.
summary, strengths, improvements는 한국어로 간결하게 작성한다.
```

### User Prompt

```txt
다음 입력 JSON을 기반으로 리포트를 생성하라.

{input}
```

### 입력 JSON 스키마

```json
{
  "difficulty": "easy | medium | hard",
  "totalQuestions": 0,
  "durationSeconds": 0,
  "overallScore": 0,
  "evaluations": [
    {
      "questionId": 0,
      "category": "string",
      "totalScore": 0,
      "strengths": ["string"],
      "improvements": ["string"]
    }
  ]
}
```

### 출력 JSON 스키마

```json
{
  "overallScore": 0,
  "grade": "A+ | A | B+ | B | C+ | C | D | F",
  "summary": "string",
  "categoryScores": [
    {
      "category": "string",
      "score": 0,
      "questionCount": 0
    }
  ],
  "strengths": ["string"],
  "improvements": ["string"]
}
```

---

## 운영 메모

- 최초 OpenAI 테스트에서는 질문을 정확히 3개만 생성한다.
- 프롬프트에는 예시 답변 문장을 넣지 않는다.
- 응답은 반드시 JSON만 허용한다.
- 백엔드에서는 JSON 파싱 실패를 별도 예외로 처리한다.
- 실제 서비스 확장 시 질문 개수는 설정값으로 다시 열 수 있다.
