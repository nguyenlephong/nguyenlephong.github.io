pipeline {

  agent any

  environment {
    DOCKER_IMAGE = "dom/profile"
    DOCKER_TAG = "lts"
  }

  options {
    skipDefaultCheckout(true)
  }

  stages {
      stage("Checkout") {
          steps{
             script {
               if (params.CLEAN_WORKSPACE) {
                 cleanWs()
                }
            }
              git credentialsId: "${GIT_CREDENTIALS}", url: "${GIT_REPO}"
              sh "git checkout ${GIT_BRANCH}"
          }
      }

      stage("Install dependency") {
      steps {
        sh "yarn"
       }
    }


    stage("Build react") {
      steps {
        sh "yarn build-prod"
      }
    }

    stage("Build docker") {
      steps {
        sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} . "
      }
    }

    stage("Deploy") {
      steps {
        script {
          try {
            sh "docker rm -f dom_profile &>/dev/null && echo \"Removed old container\""
          }
          catch (exception) {
          }
        }
        sh "docker run -d --name dom_profile -p 1070:5000 --rm ${DOCKER_IMAGE}:${DOCKER_TAG}"
      }
    }
  }

  post {
    success {
      slackSend channel: "jenkins-noti", color: "#00FF00", message: "[dom-cv.me] Success: Build successfully, new version is already."
    }
    failure{
      slackSend channel: "jenkins-noti", color: "#FF0000", message: "[dom-cv.me] Error: Build fail, please check again."
    }
  }
}
