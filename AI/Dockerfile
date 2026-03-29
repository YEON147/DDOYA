# 1. Base Image: Python 3.11 slim 버전을 사용하여 불필요한 패키지를 줄이고 용량 최적화
FROM python:3.11-slim

# 2. 필수 시스템 패키지, Timezone 및 Python 환경변수 설정
# - PYTHONDONTWRITEBYTECODE=1: .pyc 파일 생성 방지로 컨테이너 내부 찌꺼기 방지
# - PYTHONUNBUFFERED=1: 파이썬 출력을 버퍼링 없이 즉시 출력하여 docker logs 실시간 확인
# - --no-install-recommends 로 불필요한 패키지 설치 방지
# - tzdata를 통해 타임존 설정
# - opencv-python 실행을 위한 libgl1, libglib2.0-0 설치
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TZ=Asia/Seoul
RUN apt-get update && apt-get install -y --no-install-recommends \
    tzdata \
    libgl1 \
    libglib2.0-0 \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone \
    && rm -rf /var/lib/apt/lists/*

# 3. 작업 디렉토리 설정
WORKDIR /app

# 4. 의존성 파일 복사 및 설치 (도커 캐시 활용)
COPY requirements.txt .

# pip 업그레이드 및 패키지 설치 (--no-cache-dir을 사용하여 이미지 크기 축소)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 5. 애플리케이션 소스 코드 복사
COPY . .

# 6. 런타임에 모델 가중치나 데이터가 저장될 수 있는 디렉토리 및 파일 로그용 폴더 생성
RUN mkdir -p /app/weights /app/data /app/logs

# 7. 컨테이너 포트 노출 (FastAPI 기본 포트)
EXPOSE 8000

# 8. FastAPI 애플리케이션 실행
# 무거운 AI 모델 로딩 오버헤드와 메모리(OOM) 방지를 위해 기본적으로 workers는 1로 설정 고려
# ENTRYPOINT 대신 CMD를 사용하여 `docker run` 시 명령어를 쉽게 덮어쓸 수 있도록 유연성 부여
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
