#!/usr/bin/env bash

# I broke the steps of this script into multiple scripts that I can manually call from Dockerfile to make Docker debugging faster

# Install the Homebrew package manager
source bootstrap-homebrew.sh

# Install Ansible via Homebrew
source bootstrap-ansible.sh

# Run the playbooks
source bootstrap-ansible-playbooks.sh

# Print a message on completion
reverb "bootstrap.sh finished; run any os-specific bootstrap.sh scripts and then reboot"
