# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.158.0/containers/javascript-node/.devcontainer/base.Dockerfile

# [Choice] Node.js version: 14, 12, 10
ARG VARIANT="14-buster"
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${VARIANT}

WORKDIR /workspace

COPY awscli.pubkey ./

# [Optional] Uncomment this section to install additional OS packages.
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
  gpg --import awscli.pubkey && \
  curl -o awscliv2.sig https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip.sig && \
  gpg --verify awscliv2.sig awscliv2.zip && \
  unzip awscliv2.zip && \
  sudo ./aws/install && \
  rm awscliv2.zip && \
  rm -rf ./aws

# Download SAM from the Github check te 
RUN curl -OL "https://github.com/aws/aws-sam-cli/releases/download/v1.20.0/aws-sam-cli-linux-x86_64.zip" && \
  echo f6c5f1ca9ec342506ca0af5c42ee87f1f90d6f1af2e1788050acee75426cca1d aws-sam-cli-linux-x86_64.zip > sha.txt && \
  sha256sum -c sha.txt && \
  unzip aws-sam-cli-linux-x86_64.zip -d sam-installation && \
  sudo ./sam-installation/install && \ 
  rm -rf sam-installation && \
  rm aws-sam-cli-linux-x86_64.zip && \
  rm sha.txt

# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#    && apt-get -y install --no-install-recommends python3.6

# RUN pip install localstack
# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node modules
# RUN su node -c "npm install -g <your-package-list-here>"
