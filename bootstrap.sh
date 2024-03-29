#!/usr/bin/env bash

# I broke the steps of this script into multiple scripts that I can manually call from Dockerfile to make Docker debugging faster

# Install a logging helper
source bootstrap-reverb.sh

# Install the Homebrew package manager
source bootstrap-homebrew.sh

# Install Ansible via Homebrew
source bootstrap-ansible.sh

# Run the playbooks
source bootstrap-ansible-playbooks.sh

# Print a message on completion
reverb -e "bootstrap.sh finished\nrun any os-specific bootstrap.sh scripts and then reboot"
