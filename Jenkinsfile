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
                sh '''
                    set -e
                    git rev-parse --short HEAD
                '''
            }
        }

        stage('Detect Changes') {
            steps {
                script {
                    def changedFiles = sh(
                        script: '''
                            set +e
                            if [ "${GIT_PREVIOUS_SUCCESSFUL_COMMIT:-}" != "" ]; then
                              git diff --name-only "$GIT_PREVIOUS_SUCCESSFUL_COMMIT" HEAD
                            elif [ "${GIT_PREVIOUS_COMMIT:-}" != "" ]; then
                              git diff --name-only "$GIT_PREVIOUS_COMMIT" HEAD
                            else
                              git ls-files
                            fi
                        ''',
                        returnStdout: true
                    ).trim()

                    echo "Changed files:\n${changedFiles}"

                    env.BUILD_BACKEND = changedFiles.split("\\n").any { it ==~ /^backend\\/.*|^docker-compose\\.yml$|^Jenkinsfile$/ } ? "true" : "false"
                    env.BUILD_AI = changedFiles.split("\\n").any { it ==~ /^AI\\/.*|^docker-compose\\.yml$|^Jenkinsfile$/ } ? "true" : "false"

                    if (changedFiles.trim() == "") {
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
                sh '''
                    set -e
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
                    sh '''
                        set -e
                        echo "$DOCKER_PW" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Resolve Current Runtime Tags') {
            steps {
                sh '''
                    set -e

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
                    sh '''
                        set -e
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
                    sh '''
                        set -e
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
                sh '''
                    set -e
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
                sh '''
                    set -e
                    docker push ${AI_IMAGE_NAME}:latest
                    docker push ${AI_IMAGE_NAME}:${IMAGE_TAG}
                '''
            }
        }

        stage('Create Runtime Env File') {
            steps {
                sh '''
                    set -e

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
                sh '''
                    set -e
                    cd "${APP_DIR}"
                    APP_RUNTIME_ENV_FILE="${RUNTIME_ENV_FILE}" ./deploy.sh
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    echo "Current compose status:"
                    docker compose --env-file "${RUNTIME_ENV_FILE}" -f "${COMPOSE_FILE}" ps || true

                    echo "Verifying Backend..."
                    B_OK=0
                    for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do
                        if curl -fsS "http://127.0.0.1:8080/actuator/health" > /dev/null; then
                            echo "Backend is Healthy!"
                            B_OK=1
                            break
                        fi
                        sleep 5
                    done
                    if [ "$B_OK" -eq 0 ]; then
                        echo "Backend failed to become healthy."
                        exit 1
                    fi

                    if grep -q '^AI_IMAGE=' "${RUNTIME_ENV_FILE}"; then
                        echo "Verifying AI..."
                        A_OK=0
                        for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do
                            if curl -fsS "http://127.0.0.1:8000/health" > /dev/null; then
                                echo "AI is Healthy!"
                                A_OK=1
                                break
                            fi
                            sleep 5
                        done
                        if [ "$A_OK" -eq 0 ]; then
                            echo "AI failed to become healthy."
                            exit 1
                        fi
                    fi
                '''
            }
        }

        stage('Persist Current Tags') {
            steps {
                sh '''
                    set -e
                    cp "${RUNTIME_ENV_FILE}" "${BASE_ENV_FILE}"

                    grep '^SPRING_IMAGE=' "${BASE_ENV_FILE}" | cut -d'=' -f2- > "${CUR_BACKEND_TAG_FILE}" || true
                    grep '^AI_IMAGE=' "${BASE_ENV_FILE}" | cut -d'=' -f2- > "${CUR_AI_TAG_FILE}" || true
                '''
            }
        }

        stage('Cleanup Dangling Images') {
            steps {
                sh '''
                    set -e
                    docker image prune -f
                '''
            }
        }
    }

    post {
        success {
            echo "Deployment successful. Build #${env.BUILD_NUMBER}"
        }

        failure {
            sh '''
                set +e

                echo "Deployment failed. Attempting rollback..."

                cp "${BASE_ENV_FILE}" "${RUNTIME_ENV_FILE}"

                prev_backend="$(cat "${PREV_BACKEND_TAG_FILE}" 2>/dev/null || true)"
                prev_ai="$(cat "${PREV_AI_TAG_FILE}" 2>/dev/null || true)"

                if [ -n "${prev_backend}" ]; then
                  if grep -q '^SPRING_IMAGE=' "${RUNTIME_ENV_FILE}"; then
                    sed -i "s|^SPRING_IMAGE=.*|SPRING_IMAGE=${prev_backend}|" "${RUNTIME_ENV_FILE}"
                  else
                    echo "SPRING_IMAGE=${prev_backend}" >> "${RUNTIME_ENV_FILE}"
                  fi
                fi

                if [ -n "${prev_ai}" ]; then
                  if grep -q '^AI_IMAGE=' "${RUNTIME_ENV_FILE}"; then
                    sed -i "s|^AI_IMAGE=.*|AI_IMAGE=${prev_ai}|" "${RUNTIME_ENV_FILE}"
                  else
                    echo "AI_IMAGE=${prev_ai}" >> "${RUNTIME_ENV_FILE}"
                  fi
                fi

                echo "Rollback runtime image settings:"
                grep -E '^(SPRING_IMAGE|AI_IMAGE)=' "${RUNTIME_ENV_FILE}" || true

                cd "${APP_DIR}"
                APP_RUNTIME_ENV_FILE="${RUNTIME_ENV_FILE}" ./deploy.sh || true

                echo "Recent deploy log:"
                tail -n 100 "${DEPLOY_LOG}" || true

                echo "Current compose status:"
                docker compose --env-file "${RUNTIME_ENV_FILE}" -f "${COMPOSE_FILE}" ps || true
            '''
            echo "Deployment failed. Rollback attempted."
        }

        always {
            sh 'docker logout || true'
            cleanWs(deleteDirs: true, disableDeferredWipeout: true)
        }
    }
}