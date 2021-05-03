FROM python:3.7-alpine

LABEL "com.github.actions.name"="Trufflehog Actions Scan"
LABEL "com.github.actions.description"="Scan repository for secrets with basic trufflehog defaults in place for easy setup."
LABEL "com.github.actions.icon"="shield"
LABEL "com.github.actions.color"="yellow"


RUN apk --update add git less openssh && \
  rm -rf /var/lib/apt/lists/* && \
  rm /var/cache/apk/*

COPY requirements.txt /tmp/
RUN pip install --requirement /tmp/requirements.txt

COPY entrypoint.sh  /entrypoint.sh
ADD https://raw.githubusercontent.com/dxa4481/truffleHogRegexes/master/truffleHogRegexes/regexes.json /regexes.json

ENTRYPOINT ["/entrypoint.sh"]
