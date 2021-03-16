# Note: You can use any Debian/Ubuntu based image you want. 
FROM node:lts-buster

# Download SAM from Github
RUN curl -OL "https://github.com/aws/aws-sam-cli/releases/download/v1.20.0/aws-sam-cli-linux-x86_64.zip" \
  && echo f6c5f1ca9ec342506ca0af5c42ee87f1f90d6f1af2e1788050acee75426cca1d aws-sam-cli-linux-x86_64.zip > sha.txt \
  && sha256sum -c sha.txt \
  && unzip aws-sam-cli-linux-x86_64.zip -d sam-installation \
  && ./sam-installation/install \ 
  && rm -rf sam-installation \
  && rm aws-sam-cli-linux-x86_64.zip \
  && rm sha.txt

ENV SAM_CLI_TELEMETRY=0

WORKDIR /var/opt
EXPOSE 3001
ENTRYPOINT ["./start.sh"]
# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>