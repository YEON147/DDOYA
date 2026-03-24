pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'goring12'
        BACKEND_IMAGE_NAME = "${DOCKER_REGISTRY}/ddoya-backend"
        AI_IMAGE_NAME = "${DOCKER_REGISTRY}/ddoya-ai"

        IMAGE_TAG = "${env.BUILD_NUMBER}"
        APP_DIR = '/home/ubuntu/app'
        BASE_ENV_FILE = "${APP_DIR}/.env"
        RUNTIME_ENV_FILE = "${APP_DIR}/.env.runtime"
        DEPLOY_LOG = "${APP_DIR}/logs/deploy.log"
        COMPOSE_FILE = "${APP_DIR}/docker-compose.yml"

        PREV_BACKEND_TAG_FILE = "${APP_DIR}/.previous_backend_tag"
        PREV_AI_TAG_FILE = "${APP_DIR}/.previous_ai_tag"
        CUR_BACKEND_TAG_FILE = "${APP_DIR}/.current_backend_tag"
        CUR_AI_TAG_FILE = "${APP_DIR}/.current_ai_tag"
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 40, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh '''#!/usr/bin/env bash
                    set -Eeuo pipefail
                    git rev-parse --short HEAD
                '''
            }
        }

        stage('Detect Changes') {
            steps {
                script {
                    def changedFiles = sh(
                        script: '''#!/usr/bin/env bash
                            set +e
                            if [ -n "${GIT_PREVIOUS_SUCCESSFUL_COMMIT:-}" ]; then
                              git diff --name-only "$GIT_PREVIOUS_SUCCESSFUL_COMMIT" HEAD
                            elif [ -n "${GIT_PREVIOUS_COMMIT:-}" ]; then
                              git diff --name-only "$GIT_PREVIOUS_COMMIT" HEAD
                            else
                              git ls-files
                            fi
                        ''',
                        returnStdout: true
                    ).trim()

                    echo "Changed files:\n${changedFiles}"

                    def changedList = changedFiles ? changedFiles.split("\\n") : []

                    env.BUILD_BACKEND = changedList.any { it ==~ /^backend\\/.*|^docker-compose\\.yml$|^Jenkinsfile$/ } ? "true" : "false"
                    env.BUILD_AI = changedList.any { it ==~ /^AI\\/.*|^docker-compose\\.yml$|^Jenkinsfile$/ } ? "true" : "false"

                    if (!changedFiles) {
                        env.BUILD_BACKEND = "true"
                        env.BUILD_AI = "true"
                    }

                    echo "BUILD_BACKEND=${env.BUILD_BACKEND}"
                    echo "BUILD_AI=${env.BUILD_AI}"
                }
            }
        }

        stage('Validate Required Commands') {
            steps {
                sh '''#!/usr/bin/env bash
                    set -Eeuo pipefail
                    command -v docker >/dev/null 2>&1
                    command -v git >/dev/null 2>&1
                    command -v grep >/dev/null 2>&1
                    command -v awk >/dev/null 2>&1
                    command -v curl >/dev/null 2>&1
                    test -f "${BASE_ENV_FILE}"
                    test -f "${COMPOSE_FILE}"
                    test -x "${APP_DIR}/deploy.sh"
                '''
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PW'
                )]) {
                    sh '''#!/usr/bin/env bash
                        set -Eeuo pipefail
                        echo "$DOCKER_PW" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Resolve Current Runtime Tags') {
            steps {
                sh '''#!/usr/bin/env bash
                    set -Eeuo pipefail

                    mkdir -p "${APP_DIR}"

                    current_backend="$(grep '^SPRING_IMAGE=' "${BASE_ENV_FILE}" | cut -d'=' -f2- || true)"
                    current_ai="$(grep '^AI_IMAGE=' "${BASE_ENV_FILE}" | cut -d'=' -f2- || true)"

                    if [ -f "${RUNTIME_ENV_FILE}" ]; then
                      runtime_backend="$(grep '^SPRING_IMAGE=' "${RUNTIME_ENV_FILE}" | cut -d'=' -f2- || true)"
                      runtime_ai="$(grep '^AI_IMAGE=' "${RUNTIME_ENV_FILE}" | cut -d'=' -f2- || true)"
                    else
                      runtime_backend=""
                      runtime_ai=""
                    fi

                    final_backend="${runtime_backend:-$current_backend}"
                    final_ai="${runtime_ai:-$current_ai}"

                    echo "${final_backend}" > "${CUR_BACKEND_TAG_FILE}"
                    echo "${final_ai}" > "${CUR_AI_TAG_FILE}"

                    echo "Current backend image: ${final_backend}"
                    echo "Current ai image: ${final_ai}"
                '''
            }
        }

        stage('Build Backend Image') {
            when {
                expression { env.BUILD_BACKEND == 'true' }
            }
            steps {
                dir('backend') {
                    sh '''#!/usr/bin/env bash
                        set -Eeuo pipefail
                        docker build \
                          -t ${BACKEND_IMAGE_NAME}:latest \
                          -t ${BACKEND_IMAGE_NAME}:${IMAGE_TAG} \
                          -f Dockerfile .
                    '''
                }
            }
        }

        stage('Build AI Image') {
            when {
                expression { env.BUILD_AI == 'true' }
            }
            steps {
                dir('AI') {
                    sh '''#!/usr/bin/env bash
                        set -Eeuo pipefail
                        docker build \
                          -t ${AI_IMAGE_NAME}:latest \
                          -t ${AI_IMAGE_NAME}:${IMAGE_TAG} \
                          -f Dockerfile .
                    '''
                }
            }
        }

        stage('Push Backend Image') {
            when {
                expression { env.BUILD_BACKEND == 'true' }
            }
            steps {
                sh '''#!/usr/bin/env bash
                    set -Eeuo pipefail
                    docker push ${BACKEND_IMAGE_NAME}:latest
                    docker push ${BACKEND_IMAGE_NAME}:${IMAGE_TAG}
                '''
            }
        }

        stage('Push AI Image') {
            when {
                expression { env.BUILD_AI == 'true' }
            }
            steps {
                sh '''#!/usr/bin/env bash
                    set -Eeuo pipefail
                    docker push ${AI_IMAGE_NAME}:latest
                    docker push ${AI_IMAGE_NAME}:${IMAGE_TAG}
                '''
            }
        }

        stage('Create Runtime Env File') {
            steps {
                sh '''#!/usr/bin/env bash
                    set -Eeuo pipefail

                    cp "${BASE_ENV_FILE}" "${RUNTIME_ENV_FILE}"

                    old_backend="$(cat "${CUR_BACKEND_TAG_FILE}" || true)"
                    old_ai="$(cat "${CUR_AI_TAG_FILE}" || true)"

                    echo "${old_backend}" > "${PREV_BACKEND_TAG_FILE}"
                    echo "${old_ai}" > "${PREV_AI_TAG_FILE}"

                    if [ "${BUILD_BACKEND}" = "true" ]; then
                      if grep -q '^SPRING_IMAGE=' "${RUNTIME_ENV_FILE}"; then
                        sed -i "s|^SPRING_IMAGE=.*|SPRING_IMAGE=${BACKEND_IMAGE_NAME}:${IMAGE_TAG}|" "${RUNTIME_ENV_FILE}"
                      else
                        echo "SPRING_IMAGE=${BACKEND_IMAGE_NAME}:${IMAGE_TAG}" >> "${RUNTIME_ENV_FILE}"
                      fi
                    fi

                    if [ "${BUILD_AI}" = "true" ]; then
                      if grep -q '^AI_IMAGE=' "${RUNTIME_ENV_FILE}"; then
                        sed -i "s|^AI_IMAGE=.*|AI_IMAGE=${AI_IMAGE_NAME}:${IMAGE_TAG}|" "${RUNTIME_ENV_FILE}"
                      else
                        echo "AI_IMAGE=${AI_IMAGE_NAME}:${IMAGE_TAG}" >> "${RUNTIME_ENV_FILE}"
                      fi
                    fi

                    echo "Runtime image settings:"
                    grep -E '^(SPRING_IMAGE|AI_IMAGE)=' "${RUNTIME_ENV_FILE}" || true
                '''
            }
        }

        stage('Deploy') {
            steps {
                script {
                    def rc = sh(
                        returnStatus: true,
                        script: '''#!/usr/bin/env bash
                            set -Eeuo pipefail
                            set -x
                            # 깃허브(젠킨스 워크스페이스)에서 운영전용 docker-compose.prod.yml 파일을 EC2 운영 폴더로 복사!
                            cp docker-compose.prod.yml "${COMPOSE_FILE}"
                            
                            cd "${APP_DIR}"
                            echo "Running deploy with runtime env: ${RUNTIME_ENV_FILE}"
                            APP_RUNTIME_ENV_FILE="${RUNTIME_ENV_FILE}" ./deploy.sh
                        '''
                    )
                    echo "Deploy stage rc=${rc}"
                    if (rc != 0) {
                        error("Deploy stage failed with rc=${rc}")
                    }
                }
            }
        }

        stage('Persist Current Tags') {
            steps {
                script {
                    def rc = sh(
                        returnStatus: true,
                        script: '''#!/usr/bin/env bash
                            set -Eeuo pipefail
                            set -x

                            echo "STEP: Persist Current Tags - start"
                            ls -l "${RUNTIME_ENV_FILE}" || true
                            ls -l "${BASE_ENV_FILE}" || true

                            cp "${RUNTIME_ENV_FILE}" "${BASE_ENV_FILE}"

                            grep '^SPRING_IMAGE=' "${BASE_ENV_FILE}" | cut -d'=' -f2- > "${CUR_BACKEND_TAG_FILE}" || true
                            grep '^AI_IMAGE=' "${BASE_ENV_FILE}" | cut -d'=' -f2- > "${CUR_AI_TAG_FILE}" || true

                            echo "Persisted runtime env into base env."
                            grep -E '^(SPRING_IMAGE|AI_IMAGE)=' "${BASE_ENV_FILE}" || true

                            echo "STEP: Persist Current Tags - done"
                        '''
                    )
                    echo "Persist Current Tags rc=${rc}"
                    if (rc != 0) {
                        error("Persist Current Tags failed with rc=${rc}")
                    }
                }
            }
        }

        stage('Cleanup Dangling Images') {
            steps {
                sh '''#!/usr/bin/env bash
                    set +e
                    set -x

                    echo "STEP: Cleanup Dangling Images - start"
                    docker image prune -f
                    rc=$?
                    echo "Cleanup rc=${rc}"
                    echo "STEP: Cleanup Dangling Images - done"
                    exit 0
                '''
            }
        }
    }

    post {
        success {
            echo "Deployment successful. Build #${env.BUILD_NUMBER}"
        }

        failure {
            sh '''#!/usr/bin/env bash
                set +e

                echo "Deployment failed. Debugging mode: rollback deploy skipped."

                echo "Debug: whoami"
                whoami || true

                echo "Debug: file permissions"
                ls -l "${BASE_ENV_FILE}" "${RUNTIME_ENV_FILE}" || true
                ls -ld "${APP_DIR}" || true

                echo "Debug: previous/current tag files"
                ls -l "${PREV_BACKEND_TAG_FILE}" "${PREV_AI_TAG_FILE}" "${CUR_BACKEND_TAG_FILE}" "${CUR_AI_TAG_FILE}" || true

                echo "Debug: current compose status"
                docker compose --env-file "${RUNTIME_ENV_FILE}" -f "${COMPOSE_FILE}" ps || true

                echo "Debug: recent deploy log"
                tail -n 100 "${DEPLOY_LOG}" || true
            '''
            echo "Deployment failed."
        }

        always {
            sh 'docker logout || true'
            cleanWs(deleteDirs: true, disableDeferredWipeout: true)
        }
    }
}