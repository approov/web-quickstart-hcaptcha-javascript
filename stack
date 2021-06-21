#!/bin/bash

set -eu

Docker_Compose_Down() {
  sudo docker-compose down
}

Docker_Compose_Logs() {
  sudo docker-compose logs --follow --tail 1000
}

Docker_Compose_Up() {
  sudo docker-compose up --detach "${@}"
}

Main() {

  for input in  "${@}"; do
    case "${input}" in
      down )
        shift 1
        Docker_Compose_Down
        exit $?
      ;;

      logs )
        shift 1
        Docker_Compose_Logs
        exit $?
      ;;

      up )
        shift 1
        Docker_Compose_Up "${@}"
        exit $?
      ;;
    esac
  done

}

Main "${@}"
