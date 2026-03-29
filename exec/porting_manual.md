# 포팅·배포 환경 메뉴얼

EC2·Docker·Jenkins 기준 **운영(배포) 환경**과, 로컬·모바일 검증에 쓰는 **프론트(Expo) 개발 빌드** 절차를 한 문서에서 찾을 수 있도록 정리했습니다.

---

## 목차

1. [문서 개요](#문서-개요)
2. [운영 스택 및 버전](#1-운영-스택-및-버전)
3. [운영 vs 로컬](#2-운영-vs-로컬)
4. [환경 변수](#3-환경-변수-운영-기준)
5. [주요 설정 파일](#4-주요-설정-파일)
6. [프론트엔드 — 푸시·Development Build](#5-프론트엔드--푸시-알림-검증-및-development-build)
7. [로컬 Docker Compose 포트](#6-로컬-docker-compose-포트-참고)

---

## 문서 개요

| 구분 | 설명 |
| --- | --- |
| 운영 | Ubuntu(EC2), Docker Compose, Nginx, Spring Boot, MySQL, FastAPI, Jenkins 등 |
| 로컬 | 저장소 루트의 `docker-compose.yml`로 백엔드·AI·DB를 띄울 수 있음 |
| 모바일 | 푸시 등 네이티브 검증은 **Expo Go**가 아닌 **EAS Development Build** 권장 |

민감 값은 `********` 등으로 마스킹했다. 실제 값은 운영 `.env` 또는 비밀 저장소에서만 관리한다.

---

## 1. 운영 스택 및 버전

| 항목 | 내용 |
| --- | --- |
| OS | Ubuntu (EC2) |
| JVM | JDK 21 |
| Web Server | Nginx |
| WAS | Spring Boot |
| DB | MySQL 8.0 |
| AI Server | FastAPI (Python 3.11) |
| Container | Docker / Docker Compose |
| CI/CD | Jenkins |

---

## 2. 운영 vs 로컬

| 항목 | 운영(예시) | 로컬(저장소 기준) |
| --- | --- | --- |
| Compose | 배포 서버 구성 | `docker-compose.yml` |
| Spring 프로필 | `prod` 등 | `local` 기본값 가능 |
| 이미지 | 레지스트리 태그(`SPRING_IMAGE`, `AI_IMAGE` 등) | `build:` 로 소스 빌드 |
| 환경 변수 | 서버 `.env` | 루트 `.env` 또는 compose 기본값 |

아래 **환경 변수** 블록은 운영 구성을 설명하기 위한 **예시**이며, 로컬 변수명이나 기본값은 `docker-compose.yml` / `docker-compose.prod.yml` 과 다를 수 있다.

---

## 3. 환경 변수 (운영 기준)

> 실제 운영에서는 `.env` 로 관리하며, 민감 정보는 마스킹했다.

### MySQL

```
MYSQL_DATABASE=ddoya
MYSQL_USER=ddoya
MYSQL_PASSWORD=********
MYSQL_HOST=mysql
MYSQL_PORT=3306
```

### Spring Boot

```
SPRING_PORT=8080
SPRING_PROFILES_ACTIVE=prod
SPRING_IMAGE=goring12/ddoya-backend:156

DB_URL=jdbc:mysql://mysql:3306/ddoya?serverTimezone=Asia/Seoul&characterEncoding=UTF-8
DB_USERNAME=ddoya
DB_PASSWORD=********

JWT_SECRET=********
```

### FastAPI

```
FASTAPI_PORT=8000
AI_IMAGE=goring12/ddoya-ai:156
AI_BASE_URL=http://ai:8000
```

### Nginx

```
NGINX_PORT=80
```

### External Services

#### AWS S3

```
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=ddoya-prod-files-goring
```

#### OCR (CLOVA)

```
CLOVA_OCR_API_URL=...
```

#### GMS

```
GMS_OPENAI_BASE_URL=https://gms.ssafy.io/gmsapi/api.openai.com/v1
```

### AI Read Only DB

```
AI_DB_HOST=mysql
AI_DB_PORT=3306
AI_DB_NAME=ddoya
AI_DB_USERNAME=ddoya_ai_reader
AI_DB_PASSWORD=********

DATABASE_URL=mysql+pymysql://ddoya_ai_reader:********@mysql:3306/ddoya
```

### Firebase

```
FIREBASE_SERVICE_ACCOUNT_PATH=/app/secrets/firebase-service-account.json
FIREBASE_CONFIG_BASE64=********
```

---

## 4. 주요 설정 파일

### 저장소(Git) 기준

| 경로 | 설명 |
| --- | --- |
| `docker-compose.yml` | 로컬 통합 실행(MySQL, AI, Backend 등) |
| `docker-compose.prod.yml` | 운영용 이미지·설정 예시 |
| `frontend/my-app/` | Expo 앱 소스 |
| `frontend/my-app/eas.json` | EAS Build 프로필(`development`, `preview`, `production`) |
| `frontend/my-app/app.json` | Expo 앱 ID·권한·플러그인 등 |

### 배포 서버에서 별도 관리되는 경우(예시)

운영 서버에만 두거나, CI에서 주입하는 파일이다. 레포에 없을 수 있다.

| 파일 | 설명 |
| --- | --- |
| `.env` | 운영 시크릿·엔드포인트 |
| `nginx.conf` | Reverse Proxy |
| `deploy.sh` | 배포 자동화 |
| `backup_db.sh` | DB 백업 |

---

## 5. 프론트엔드 — 푸시 알림 검증 및 Development Build

푸시 알림은 **네이티브 설정**이 필요하므로 **Expo Go**보다 **Development Build**가 실제 환경에 가깝다. 개발 빌드는 프로젝트 전용 네이티브 바이너리를 포함한다.

| 항목 | 내용 |
| --- | --- |
| 목적 | 안드로이드에서 푸시 등 네이티브 기능을 실제에 가깝게 테스트 |
| 실행 방식 | EAS로 Android Development Build 생성 후 기기에 설치 |
| 로컬 연결 | `npx expo start --dev-client` (필요 시 `--tunnel`) |

### 선행 조건

- [Node.js](https://nodejs.org/) (LTS 권장)
- EAS CLI: `npm i -g eas-cli`
- [Expo](https://expo.dev/) 계정 (`eas login`)

프로젝트는 **Expo SDK 54** 계열(`expo` `~54.x`)을 사용한다. SDK 업그레이드 시 EAS·네이티브 모듈 호환 여부를 별도 확인한다.

### 절차 요약

| 단계 | 작업 |
| --- | --- |
| 1 | `frontend/my-app` 으로 이동 |
| 2 | `eas login` |
| 3 | `eas.json` 없으면 `eas build:configure` |
| 4 | `eas build --profile development --platform android` |
| 5 | 빌드 완료 후 기기에서 설치 링크로 APK 설치 |
| 6 | PC에서 `npx expo start --dev-client` (망 문제 시 `--tunnel`) |
| 7 | 기기 앱에서 QR·서버 목록·URL 입력으로 개발 서버 연결 |

### 1. 프로젝트 폴더 이동

```bash
cd frontend/my-app
```

### 2. Expo 계정 로그인

```bash
eas login
```

### 3. EAS 빌드 설정 초기화

`eas.json` 이 없을 때만 실행한다.

```bash
eas build:configure
```

### 4. Android Development Build 생성

```bash
eas build --profile development --platform android
```

완료 후 설치 링크 또는 QR이 제공된다. `eas.json` 의 `development` 프로필(`developmentClient: true`)이 있어야 한다. 팀에서 프로필 이름이 다르면 해당 이름으로 치환한다.

### 5. Android 기기에 설치

빌드가 제공한 **설치 링크**를 실제 기기 브라우저에서 연다.

### 6. 로컬 개발 서버

```bash
npx expo start --dev-client
```

기기가 같은 LAN에서 서버를 찾지 못하면:

```bash
npx expo start --dev-client --tunnel
```

### 7. 앱에서 개발 서버 연결

1. 터미널 **QR 코드**를 기기 **기본 카메라**로 스캔  
2. 앱의 **개발 서버 목록**에서 선택  
3. 필요 시 **서버 URL** 직접 입력  

연결되면 해당 시점 소스가 기기에서 실행되며, 푸시 알림 등을 검증할 수 있다.

---

## 6. 로컬 Docker Compose 포트 참고

`docker-compose.yml` 기준 **호스트 → 컨테이너** 매핑 예시다. 운영 Nginx 뒤 포트와는 다를 수 있다.

| 서비스 | 호스트 포트 | 컨테이너 포트 |
| --- | --- | --- |
| MySQL | 3307 | 3306 |
| FastAPI (AI) | 8000 | 8000 |
| Spring Boot (Backend) | 8080 | 8080 |

백엔드 헬스체크 등은 각 서비스 문서·`docker-compose.yml` 의 `healthcheck` 를 따른다.
