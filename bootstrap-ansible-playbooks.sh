#!/usr/bin/env bash

# Source .functionsrc to get access to the ruler function
# shellcheck disable=SC1091
source zsh/.functionsrc

# Run the playbooks with debug printing
ruler "Running ansible-playbook-main.yml"
ansible-playbook -vvv ansible-playbook-main.yml
