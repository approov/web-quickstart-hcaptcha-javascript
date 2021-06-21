#!/bin/sh

set -eu

Main() {

  if [ -f ./.env ]; then
    . ./.env
  fi

  curl https://hcaptcha.com/siteverify \
    -X POST \
    -d "response=${1}&secret=${HCAPTCHA_SECRET}"

  # add empty line to output
  echo
}

Main "${@}"
