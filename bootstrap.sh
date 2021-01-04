#!/usr/bin/env bash

# I broke the steps of this script into multiple scripts that I can manually call from Dockerfile to make Docker debugging faster

# Source .functionsrc to get access to the ruler function
# shellcheck disable=SC1091
source zsh/.functionsrc

# Install the Homebrew package manager
source bootstrap-homebrew.sh

# Install Ansible via Homebrew
source bootstrap-ansible.sh

# Run the playbooks
source bootstrap-ansible-playbooks.sh

# Print a message on completion
ruler "bootstrap.sh finished; run any os-specific bootstrap.sh scripts and then reboot"
