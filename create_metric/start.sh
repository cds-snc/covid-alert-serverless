#!/bin/bash
set -o errexit

# temporary hack from https://github.com/aws/aws-sam-cli/issues/2492#issuecomment-783235715
# needed until https://github.com/aws/aws-sam-cli/pull/2700 is merged
function hackLocalhostIp {
    local localhost_ip
    localhost_ip="$(getent hosts host.docker.internal | awk '{ print $1 }')"
    # Docker mounts /etc/hosts so we can't update the file in place with sed
    cp /etc/hosts tmpfile
    sed "/^127.0.0.1/ s/.*/$localhost_ip\tlocalhost/g" < tmpfile > /etc/hosts 
    rm tmpfile
}

hackLocalhostIp

BASEDIR="$1"
echo "Using $BASEDIR for docker-volume-basedir"
/usr/local/bin/sam local start-api \
  --docker-volume-basedir "${BASEDIR}" \
  --warm-containers "EAGER" \
  --region ca-central-1 \
  --docker-network "serverless_devcontainer_default"
