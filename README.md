# Git Branch Strategy

본 프로젝트는 **Git Flow 기반 브랜치 전략**을 사용한다.

---

## Branch Structure

```
main
 └─ develop
     ├─ feature/*
     ├─ release/*
     └─ hotfix/*
```

Git Flow는 **5개의 브랜치 유형**으로 구성된다.


| 브랜치           | 설명                         |
| ------------- | -------------------------- |
| main (master) | 실제 서비스에 배포되는 안정적인 코드       |
| develop       | 다음 버전을 개발하는 통합 개발 브랜치      |
| feature       | 새로운 기능 개발을 위한 브랜치          |
| release       | 배포 전 QA 및 테스트를 위한 브랜치      |
| hotfix        | 배포된 서비스에서 발생한 긴급 버그 수정 브랜치 |


- **main, develop** → 항상 유지되는 메인 브랜치
- **feature, release, hotfix** → 작업 후 삭제되는 보조 브랜치

---

## Branch Naming Rule

브랜치 이름은 **가독성과 일관성을 위해 다음 규칙을 따른다.**

### 기본 규칙

- 브랜치는 **소문자**로 작성
- 단어 구분은 **kebab-case(-)** 사용
- 공백 사용 금지


| 브랜치     | 명명 규칙               | 예시                   |
| ------- | ------------------- | -------------------- |
| feature | `feature/{기능명}`     | `feature/login-api`  |
| release | `release/{version}` | `release/v1.0.0`     |
| hotfix  | `hotfix/{버그내용}`     | `hotfix/login-error` |


---

## Commit Convention

커밋 메시지는 아래 Conventional Commits 문서를 기준으로 작성한다.

- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)

### 기본 규칙

- 커밋 태그는 `fix`, `feat`, `refactor`, `docs` 네 가지만 사용한다.
- 태그는 반드시 **소문자**로 작성한다.
- 변경 사항 설명은 **한국어로 최대한 자세히** 작성한다.
- 다른 사람이 봤을 때도 어떤 부분이 변경된 건지 확인할 수 있도록 작성한다.

### 예시

```text
feat: 로그인 API 연동 및 예외 처리 추가
fix: 비밀번호 재설정 시 토큰 만료 검증 누락 문제 수정
refactor: 회원 조회 서비스 로직 분리 및 중복 코드 제거
docs: 브랜치 전략 및 커밋 규칙 문서화
```

---

## PR 설명 작성 규칙

PR에는 아래 내용을 반드시 포함한다.

### 작성 템플릿

```md
## 작업 내용
- 구현한 기능 또는 수정 사항 설명

## 변경 사항
- 주요 코드 변경 사항

## 테스트
- 테스트 방법 또는 확인한 사항
```

### 작성 가이드

- 작업 목적과 배경이 드러나도록 `작업 내용`을 작성한다.
- 리뷰어가 빠르게 파악할 수 있도록 `변경 사항`을 구체적으로 작성한다.
- 실제로 확인한 항목을 기준으로 `테스트`를 작성한다.

