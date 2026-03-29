# 🏗️ Deployment Environment

## 1. 사용 환경 및 버전


| 항목         | 내용                      |
| ---------- | ----------------------- |
| OS         | Ubuntu (EC2)            |
| JVM        | JDK 21                  |
| Web Server | Nginx                   |
| WAS        | Spring Boot             |
| DB         | MySQL 8.0               |
| AI Server  | FastAPI (Python 3.11)   |
| Container  | Docker / Docker Compose |
| CI/CD      | Jenkins                 |


---

## ⚙️ Environment Variables

> ⚠️ 실제 운영 환경에서는 `.env` 파일로 관리하며,  
> 보안을 위해 민감 정보는 마스킹 처리했습니다.

### 🗄️ MySQL

```
MYSQL_DATABASE=ddoya
MYSQL_USER=ddoya
MYSQL_PASSWORD=********
MYSQL_HOST=mysql
MYSQL_PORT=3306
```

### ☕ Spring Boot

```
SPRING_PORT=8080
SPRING_PROFILES_ACTIVE=prod
SPRING_IMAGE=goring12/ddoya-backend:156

DB_URL=jdbc:mysql://mysql:3306/ddoya?serverTimezone=Asia/Seoul&characterEncoding=UTF-8
DB_USERNAME=ddoya
DB_PASSWORD=********

JWT_SECRET=********
```

### 🤖 FastAPI

```
FASTAPI_PORT=8000
AI_IMAGE=goring12/ddoya-ai:156
AI_BASE_URL=http://ai:8000
```

### 🌐 Nginx

```
NGINX_PORT=80
```

### ☁️ External Services

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

### 📖 AI Read Only DB

```
AI_DB_HOST=mysql
AI_DB_PORT=3306
AI_DB_NAME=ddoya
AI_DB_USERNAME=ddoya_ai_reader
AI_DB_PASSWORD=********

DATABASE_URL=mysql+pymysql://ddoya_ai_reader:********@mysql:3306/ddoya
```

### 🔥 Firebase

```
FIREBASE_SERVICE_ACCOUNT_PATH=/app/secrets/firebase-service-account.json
FIREBASE_CONFIG_BASE64=********
```

---

## 📂 Key Configuration Files


| 파일                   | 설명               |
| -------------------- | ---------------- |
| `.env`               | 환경 변수 설정         |
| `docker-compose.yml` | 서비스 컨테이너 구성      |
| `nginx.conf`         | Reverse Proxy 설정 |
| `deploy.sh`          | 배포 자동화 스크립트      |
| `backup_db.sh`       | DB 백업 스크립트       |


