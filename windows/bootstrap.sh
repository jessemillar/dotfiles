#!/usr/bin/env bash

ansible-playbook ansible-playbook-*.yml -vvvv

# Print a message on completion
echo -e "windows/bootstrap.sh finished"
