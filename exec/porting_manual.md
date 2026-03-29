# 📦 포팅 및 배포 환경 매뉴얼 (Porting Manual)

본 문서는 `S14P21B202` 프로젝트(`ddoya`)의 인프라 아키텍처, 운영 배포 프로세스 및 로컬·모바일 프론트엔드 검증 절차에 대한 전반적인 가이드를 제공합니다.

---

## 1. 문서 개요

| 구분 | 설명 |
| --- | --- |
| **운영 (배포)** | Ubuntu(EC2), Docker Compose, Nginx, Spring Boot, MySQL, FastAPI, Jenkins 기반 CI/CD 파이프라인 |
| **로컬 (개발)** | 저장소 루트의 `docker-compose.yml`을 통해 백엔드·AI·DB 컨테이너를 통합 실행 가능 |
| **모바일 (기기)** | 푸시 알림 등 네이티브 기능 검증은 **Expo Go**가 아닌 **EAS Development Build** 사용 권장 |

> ⚠️ 실제 환경 변수는 보안을 위해 **마스킹** 처리하였으며, 실제 운영 및 배포 시에는 보안이 적용된 별도 저장소 혹은 운영 장비의 `.env` 파일 내에서 관리됩니다.

---

## 2. 운영 스택 및 버전

### 2.1. 인프라 및 서버
| 구성 요소 | 제품 명 및 버전 | 세부 확인 사항 |
|---|---|---|
| **OS** | Ubuntu 22.04 LTS (AWS EC2) | 시간대 `Asia/Seoul`, UFW(방화벽) 통해 80, 443, 8081 포트 개방 |
| **Container** | Docker / Docker Compose | `usermod -aG docker`를 통해 ubuntu/jenkins 유저 권한 분리 |
| **Web Server** | Nginx | AWS EC2 내 HTTPS 리버스 프록시 수행 (`proxy_pass http://127.0.0.1:8080`) |
| **TLS/SSL** | Let's Encrypt / Certbot | `j14b202.p.ssafy.io` 도메인 연결 및 HTTP -> HTTPS 포워딩 자동화 |
| **CI/CD** | Jenkins (Java 21 백그라운드) | 포트 8081 바인딩, 파이프라인 기반 자동 빌드 및 타임아웃 롤백 연동 |

### 2.2. 백엔드 및 WAS (서버 애플리케이션)
| 구성 요소 | 버전 및 도구 | 세부 설정 사항 |
|---|---|---|
| **Language** | Java 21 | `Eclipse Temurin 21 JRE`를 이용해 경량 런타임 이미지 적용 |
| **WAS** | Spring Boot | Docker 컨테이너 내 `8080` 포트로 실행 |
| **Build Tool** | Gradle (`8.7-jdk21`) | Dockerfile 내 빌드 스테이지 활용 (Multi-stage Build) |

### 2.3. AI 서버 엔진
| 구성 요소 | 버전 및 도구 | 세부 설정 사항 |
|---|---|---|
| **Language** | Python 3.11-slim | 환경변수 최적화 및 `libgl1` 필수 라이브러리 구성 |
| **Framework** | FastAPI | Docker 컨테이너 내 `8000` 포트로 실행 |
| **ASGI Server**| Uvicorn | `workers 1` 옵션 부여로 무거운 모델 로딩 시 OOM 방지 |

### 2.4. 데이터베이스 및 백업
| 구성 요소 | 제품 명 및 버전 | 세부 설정 사항 |
|---|---|---|
| **RDBMS** | MySQL 8.0 | AI 분석 부하 분산을 위한 **읽기 전용 계정**(`ddoya_ai_reader`) 별도 운영 |
| **Automation** | Crontab + Shell 스크립트 | 주기적 로컬 논리 백업 및 AWS S3 동기화 아카이빙 처리 |

---

## 3. 운영 환경 vs 로컬 환경

동일한 컨테이너 기반 환경을 사용하지만 목적에 따라 설정 파일과 구동 방식이 차별화됩니다.

| 항목 | 운영(Deploy) 기준 예시 | 로컬(Local) 테스트 기준 |
| --- | --- | --- |
| **Docker Compose** | 배포 서버 구성 스크립트 연결 | 저장소 루트의 `docker-compose.yml` 사용 |
| **Spring 프로필** | `prod` 등 실제 운영 목적의 프로필 지정 | `local` 등 개발 환경 기본 프로필 지정 가능 |
| **Docker Image** | 레지스트리 태그 명시 (`SPRING_IMAGE` 등) | `build: .` 구문을 이용해 로컬 소스로 빌드 |
| **환경 변수** | 운영 서버 전용 최상위 `.env` 파일 | 저장소 루트 `.env` 혹은 compose 상 기본값 주입 |

#### 참고: 로컬 Docker Compose 포트 구성
로컬(개발) `docker-compose.yml` 기준 호스트 ➔ 컨테이너 네트워크 매핑 포트입니다. *운영 환경의 Nginx 리버스 프록시 뒤에 숨겨진 구조와는 다를 수 있습니다.*

| 서비스 | 호스트 포트 | 컨테이너 포트 |
| --- | --- | --- |
| MySQL | 3307 | 3306 |
| FastAPI (AI) | 8000 | 8000 |
| Spring Boot (Backend) | 8080 | 8080 |

*(백엔드 헬스체크 등은 각 서비스의 문서 및 `docker-compose.yml` 상의 `healthcheck` 설정을 우선적으로 따릅니다.)*

---

## 4. 백엔드 및 인프라 운영 배포 가이드

### 4.1. 무중단 배포 스크립트 (`deploy.sh`) 구조 및 특징
Jenkins 파이프라인에서 작동하며, 로컬에서 수동 스크립트 배포 시에도 안전하게 컨테이너를 스위칭하는 절차입니다.

1. **검증 및 환경 변수 스위칭:** 현재 운영 중인 설정을 덮어쓰지 않고 최신 빌드 태그가 반영된 `.env.runtime` 환경 파일을 임시 배포용으로 생성하여 `docker compose config` 유효성 검증을 거칩니다.
2. **컨테이너 Health Checks:** 배포 직후 HTTP 통신(`curl 8000, 8080`) 및 `docker inspect`를 통해 실제 서비스가 정상 개방되었는지 최대 120초~180초 간 폴링(Polling) 대기하며 상태를 검증합니다.
3. **의존성 기반 순차 부팅:** `MySQL` ➔ `AI(Depends_On: MySQL)` ➔ `Spring Boot(Depends_On: AI)` 순으로 `service_healthy`를 부팅 조건으로 잡아 의존성을 보장합니다.
4. **결함 시 자동 롤백:** 상태 검증 중 타임아웃 오류 발생 시, 사전에 기록해 둔 이전 버전의 Image Tag 파일(`.previous_tag`)을 로드하여 즉각적인 자동 복원 프로세스가 진행됩니다.

---

## 5. 프론트엔드 — 푸시 알림 검증 및 Development Build

앱의 푸시 알림 등 네이티브 인증 기능은 범용 앱인 Expo Go에서는 온전한 테스트가 불가능하므로, 실제 서비스와 가장 유사한 **EAS Development Build** 환경을 권장합니다.

### 5.1. 프론트엔드 빌드 개요
- **목적:** 안드로이드 환경에서 푸시 알림 등 Android System 네이티브 기능 구동을 테스트합니다.
- **실행 방식:** Expo Application Services (EAS) 클라우드 상에서 Android Development Build 바이너리(APK 형태) 생성 후 물리 기기에 직접 설치.
- **로컬 검증 연결:** 물리 기기와 PC 간 터널링(`npx expo start --dev-client --tunnel`)을 통해 로컬 개발 서버를 실물 디바이스에 연결시킵니다.

### 5.2. 개발 빌드 선행 조건 및 진행 절차
> 프론트엔드 프로젝트는 **Expo SDK 54** 계열(`expo ~54.x`)에서 동작합니다. **Node.js LTS** 및 Expo 계정(`eas login`) 인증, `eas-cli` 글로벌 설치가 선행되어야 합니다. *(SDK 변경 시 EAS·Native Module 호환 확인 필수)*

| 단계 | 명령어 및 작업 절차 |
| --- | --- |
| 1 | 프로젝트 타겟 폴더로 이동합니다. (`cd frontend/my-app`) |
| 2 | Expo 계정으로 로그인합니다. (`eas login`) |
| 3 | 빌드 설정이 초기화되지 않았다면 진행합니다. (`eas.json` 없을 시 `eas build:configure` 수행) |
| 4 | **Android Development Build 생성:** `eas build --profile development --platform android` <br>*(단, `eas.json` 내 `developmentClient: true` 프로필 설정 필요)* |
| 5 | 클라우드 빌드 종료 후 도출된 **설치 링크 및 QR 코드**를 열어 개발용 빌드를 안드로이드 공기계에 설치. |
| 6 | 로컬 PC에서 개발 서버 런타임 구동: `npx expo start --dev-client` <br>*(동일 LAN 공유가 불가능한 네트워크 문제 시 뒤에 `--tunnel` 옵션 추가)* |
| 7 | 기기(개발용 앱 다운로드 완료 건)에 진입 후 카메라를 켜고 터미널의 서버 연결 QR을 촬영. 연결 목록 또는 URL 입력 후 진입하여 라이브 테스트 및 푸시 검증 진행. |

---

## 6. 환경 변수 (운영 기준 예시)

실제 프로덕션 배포 시점의 주요 설정 값들을 나열한 템플릿입니다. `********` 처리된 민감 값은 EC2 보안 저장소의 `.env` 구성에서 다루어집니다.

```env
# MySQL
MYSQL_ROOT_PASSWORD=********
MYSQL_DATABASE=ddoya
MYSQL_USER=ddoya
MYSQL_PASSWORD=********
MYSQL_HOST=mysql
MYSQL_PORT=3306

# Spring Boot
SPRING_PORT=8080
SPRING_PROFILES_ACTIVE=prod
SPRING_IMAGE=goring12/ddoya-backend:156 # Jenkins 빌드 시 최신 IMAGE_TAG 순환

DB_URL=jdbc:mysql://mysql:3306/ddoya?serverTimezone=Asia/Seoul&characterEncoding=UTF-8
DB_USERNAME=ddoya
DB_PASSWORD=********

JWT_SECRET=********

# FastAPI (AI 서버)
FASTAPI_PORT=8000
AI_IMAGE=goring12/ddoya-ai:156 # Jenkins 빌드 시 태그 자동 갱신
AI_BASE_URL=http://ai:8000

# Nginx
NGINX_PORT=80

# AWS S3
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=ddoya-prod-files-goring

# OCR API (CLOVA)
CLOVA_OCR_API_URL=...

# GMS (SSAFY OpenAI)
GMS_OPENAI_BASE_URL=https://gms.ssafy.io/gmsapi/api.openai.com/v1

# AI Read Only DB (분리 계정)
AI_DB_HOST=mysql
AI_DB_PORT=3306
AI_DB_NAME=ddoya
AI_DB_USERNAME=ddoya_ai_reader
AI_DB_PASSWORD=********

DATABASE_URL=mysql+pymysql://ddoya_ai_reader:********@mysql:3306/ddoya

# Firebase (앱 푸시용)
FIREBASE_SERVICE_ACCOUNT_PATH=/app/secrets/firebase-service-account.json
FIREBASE_CONFIG_BASE64=********
```

---

## 7. 주요 계정 및 프로퍼티 정의 시스템 파일

프로젝트 루트 및 서버 내부에 위치하여 설정 및 실행 플로우를 총괄하는 파일 목록입니다. 

### 7.1. 코드 저장소 (Git) 기준 파일
| 파일 경로 | 파일 설명 |
|---|---|
| `docker-compose.yml` | MySQL, AI, Backend 등 로컬에서 서비스를 통합 부팅하기 위한 정의 문서 |
| `docker-compose.prod.yml` | 실제 운영 환경의 최적화된 컴포즈 이미지 태깅 및 환경 관리를 돕는 레퍼런스 파일 |
| `frontend/my-app/eas.json` | EAS 빌드 프로필 (e.g., `development`, `preview`, `production`) 설정 파일 |
| `frontend/my-app/app.json` | Expo 모바일 애플리케이션 식별자(ID), 권한, 및 네이티브 외부 플러그인 매니페스트 관리 파일 |

### 7.2. 운영 서버 측 별도 관리되는 파일 (레포지토리 미포함, EC2 내부)
| 파일 위치 | 파일 설명 |
|---|---|
| `.env` / `.env.runtime` | 운영 인프라의 주요 시크릿 데이터, API 엔드포인트 URL 및 CI/CD 이미지 태그 치환본 분기 저장 |
| `nginx.conf` | 포트 80 및 단일 443(HTTPS) 통신을 Spring (8080) 포트로 라우팅하는 Reverse Proxy 정의 |
| `deploy.sh` | 로컬 터미널 쉘 기반 Health Monitoring 구동 및 자동화 롤백 제어를 주관하는 배포 스크립트 |
| `backup_db.sh` | Crontab 데몬 스케줄러와 연동해 주기적으로 MySQL 덤프를 생성 후 AWS S3에 동기화·아카이빙하는 백업 스크립트 |

---

## 8. 외부 서비스 연동 프로비저닝 정보

서버 기동 및 비즈니스 목적을 위해 연동된 클라우드 파사드 계층의 플랫폼 정보입니다.

### 8.1. AWS S3 (Amazon Simple Storage Service) & IAM
- **도입 목적:** AI 분석을 위한 다량의 유저 앱 이미지 적재 및 데이터베이스 덤프, 스냅샷 보존용 스토리지.
- **보안 세팅:** 외부의 불특정 다수의 다운로드 접근을 원천 차단(Block all public access)하고, 전용 IAM 사용자 이름 `ddoya-s3-user` 발급하여 자사 어플리케이션은 액세스 인증 키셋만을 통해 무사고 보안 업로드를 지원.

### 8.2. CLOVA OCR API (NCP 플랫폼)
- **도입 목적:** 캡쳐하거나 촬영한 영양제 후면 복잡한 성분표로부터 텍스트 데이터의 특징을 고정밀도로 추출하는 핵심 처리 파이프라인.
- **보안 세팅:** 네이버 클라우드 플랫폼(NCP)의 API Gateway 인증 서비스와 CLOVA OCR 요금제를 조합, 발급받은 Secret Key를 `CLOVA_OCR_API_URL`으로 전송하여 FastAPI 컨테이너에서 백그라운드 호출.

### 8.3. GMS (SSAFY 단독 AI 엔진 기반 / 프록시 OpenAI 플랫폼)
- **도입 목적:** 추출된 원본 비정형 텍스트를 구조적으로 정제하고 다양한 약물 상호 충돌성을 추론 예측하기 위한 거대 언어 모델 기반 LLM 질의 지원.
- **보안 세팅:** SSAFY 자체 교육용 지원 콘솔을 통해 `GMS_API_KEY` 발급 승인을 거치고, OpenAI 공식 API 주소에 대한 리디렉션을 SSAFY 프록시 도메인(`gms.ssafy.io/gmsapi/...`) 우회 통신으로 대체 설정하여 운영.
