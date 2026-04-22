// Jenkinsfile — Declarative pipeline running Playwright tests with sharding.
// Requirements:
//   - Jenkins agent with Docker support, OR
//   - Agent with Node 20+ + ability to install Playwright browsers (--with-deps).
//   - Plugins (recommended): "JUnit", "HTML Publisher", "AnsiColor", "Allure", "Pipeline Stage View".

pipeline {
    agent any

    options {
        timestamps()
        ansiColor('xterm')
        buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '10'))
        timeout(time: 90, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    parameters {
        choice(name: 'TEST_ENV',     choices: ['dev', 'staging', 'prod'], description: 'Target environment')
        string(name: 'SHARD_TOTAL',  defaultValue: '4', description: 'Total parallel shards')
        string(name: 'GREP',         defaultValue: '',  description: 'Optional --grep pattern, e.g. @smoke')
        booleanParam(name: 'UPDATE_SNAPSHOTS', defaultValue: false, description: 'Update visual snapshots')
    }

    environment {
        CI         = 'true'
        TEST_ENV   = "${params.TEST_ENV}"
        NODE_ENV   = 'test'
        // Shrink CPU usage on shared Jenkins boxes — override via env if needed.
        WORKERS    = '50%'
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Setup') {
            steps {
                sh '''#!/usr/bin/env bash
                  set -euo pipefail
                  node --version
                  npm --version
                  npm ci
                  npx playwright install --with-deps
                '''
            }
        }

        stage('Lint & Typecheck') {
            parallel {
                stage('typecheck') { steps { sh 'npm run typecheck' } }
                stage('lint')      { steps { sh 'npm run lint' } }
                stage('format')    { steps { sh 'npm run format:check' } }
            }
        }

        stage('Test (sharded)') {
            steps {
                script {
                    def shardTotal = params.SHARD_TOTAL.toInteger()
                    def grepArg    = params.GREP ? "--grep '${params.GREP}'" : ''
                    def updateArg  = params.UPDATE_SNAPSHOTS ? '--update-snapshots' : ''
                    def shards     = (1..shardTotal).collect { it }
                    def jobs       = [:]
                    shards.each { idx ->
                        jobs["shard-${idx}/${shardTotal}"] = {
                            sh """#!/usr/bin/env bash
                              set -euo pipefail
                              mkdir -p reports/blob-report-${idx}
                              npx playwright test --shard=${idx}/${shardTotal} ${grepArg} ${updateArg} \
                                --reporter=blob,list,junit \
                                --output=test-results/shard-${idx}
                              # rename blob output so we can stash per shard
                              if [ -d reports/blob-report ]; then
                                mv reports/blob-report reports/blob-report-${idx}
                              fi
                            """
                            stash name: "blob-${idx}",   includes: "reports/blob-report-${idx}/**", allowEmpty: true
                            stash name: "allure-${idx}", includes: 'reports/allure-results/**',     allowEmpty: true
                            stash name: "junit-${idx}",  includes: 'reports/junit/**',              allowEmpty: true
                            stash name: "results-${idx}", includes: 'test-results/**',              allowEmpty: true
                        }
                    }
                    parallel jobs
                }
            }
        }

        stage('Merge & publish reports') {
            steps {
                script {
                    def shardTotal = params.SHARD_TOTAL.toInteger()
                    (1..shardTotal).each { idx ->
                        try { unstash "blob-${idx}"   } catch (e) { echo "no blob for ${idx}" }
                        try { unstash "allure-${idx}" } catch (e) { echo "no allure for ${idx}" }
                        try { unstash "junit-${idx}"  } catch (e) { echo "no junit for ${idx}" }
                        try { unstash "results-${idx}" } catch (e) { echo "no results for ${idx}" }
                    }
                }

                sh '''#!/usr/bin/env bash
                  set -euo pipefail
                  mkdir -p reports/blob-merged
                  # Combine each shard's blob into one folder for merge-reports
                  find reports -maxdepth 1 -type d -name 'blob-report-*' -exec sh -c 'cp -R "$0"/. reports/blob-merged/' {} \\;
                  npx playwright merge-reports --reporter=html ./reports/blob-merged || true
                  npx allure generate ./reports/allure-results --clean -o ./reports/allure-report || true
                '''
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'reports/junit/**/*.xml'

                    publishHTML(target: [
                        allowMissing: true, alwaysLinkToLastBuild: true, keepAll: true,
                        reportDir: 'playwright-report', reportFiles: 'index.html',
                        reportName: 'Playwright HTML Report'
                    ])
                    publishHTML(target: [
                        allowMissing: true, alwaysLinkToLastBuild: true, keepAll: true,
                        reportDir: 'reports/monocart-report', reportFiles: 'index.html',
                        reportName: 'Monocart Report'
                    ])
                    publishHTML(target: [
                        allowMissing: true, alwaysLinkToLastBuild: true, keepAll: true,
                        reportDir: 'reports/allure-report', reportFiles: 'index.html',
                        reportName: 'Allure Report (static)'
                    ])

                    archiveArtifacts artifacts: 'reports/**, playwright-report/**, test-results/**',
                                     allowEmptyArchive: true, fingerprint: false
                }
            }
        }
    }

    post {
        always {
            // Optional: requires the Allure Jenkins plugin to render trends.
            script {
                if (fileExists('reports/allure-results')) {
                    try {
                        allure includeProperties: false, jdk: '', results: [[path: 'reports/allure-results']]
                    } catch (e) {
                        echo "Allure Jenkins plugin not installed — skipping interactive publish."
                    }
                }
            }
        }
    }
}
