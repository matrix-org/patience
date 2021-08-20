# This Dockerfile is intended for Patience's own CI.
# It may change at any time.

FROM golang:1.16-buster

RUN echo "deb http://deb.debian.org/debian buster-backports main" > /etc/apt/sources.list.d/patience.list && apt-get update && apt-get install -y libolm3 libolm-dev/buster-backports chromium
RUN curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
