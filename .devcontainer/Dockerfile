# Note: You can use any Debian/Ubuntu based image you want. 
FROM mcr.microsoft.com/vscode/devcontainers/base:0-buster

# [Option] Install zsh
ARG INSTALL_ZSH="true"
# [Option] Upgrade OS packages to their latest versions
ARG UPGRADE_PACKAGES="false"
# [Option] Enable non-root Docker access in container
ARG ENABLE_NONROOT_DOCKER="true"
# [Option] Use the OSS Moby CLI instead of the licensed Docker CLI
ARG USE_MOBY="true"

# Install needed packages and setup non-root user. Use a separate RUN statement to add your
# own dependencies. A user of "automatic" attempts to reuse an user ID if one already exists.
ARG USERNAME=automatic
ARG USER_UID=1000
ARG USER_GID=$USER_UID
COPY library-scripts/*.sh /tmp/library-scripts/
RUN apt-get update \
    && /bin/bash /tmp/library-scripts/common-debian.sh "${INSTALL_ZSH}" "${USERNAME}" "${USER_UID}" "${USER_GID}" "${UPGRADE_PACKAGES}" \
    # Use Docker script from script library to set things up
    && /bin/bash /tmp/library-scripts/docker-debian.sh "${ENABLE_NONROOT_DOCKER}" "/var/run/docker-host.sock" "/var/run/docker.sock" "${USERNAME}" \
    # Clean up
    && apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/* /tmp/library-scripts/

# Setting the ENTRYPOINT to docker-init.sh will configure non-root access 
# to the Docker socket. The script will also execute CMD as needed.
ENTRYPOINT [ "/usr/local/share/docker-init.sh" ]
CMD [ "sleep", "infinity" ]

WORKDIR /workspace

COPY awscli.pubkey ./

# [Optional] Uncomment this section to install additional OS packages.
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
  && gpg --import awscli.pubkey \
  && curl -o awscliv2.sig https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip.sig \
  && gpg --verify awscliv2.sig awscliv2.zip \
  && unzip awscliv2.zip \
  && sudo ./aws/install \
  && rm awscliv2.zip \
  && rm -rf ./aws

# Download SAM from the Github check te 
RUN curl -OL "https://github.com/aws/aws-sam-cli/releases/download/v1.20.0/aws-sam-cli-linux-x86_64.zip" \
  && echo f6c5f1ca9ec342506ca0af5c42ee87f1f90d6f1af2e1788050acee75426cca1d aws-sam-cli-linux-x86_64.zip > sha.txt \
  && sha256sum -c sha.txt \
  && unzip aws-sam-cli-linux-x86_64.zip -d sam-installation \
  && sudo ./sam-installation/install \ 
  && rm -rf sam-installation \
  && rm aws-sam-cli-linux-x86_64.zip \
  && rm sha.txt

ENV SAM_CLI_TELEMETRY=0
# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>