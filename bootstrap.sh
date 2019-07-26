#!/usr/bin/env bash

# Install the Homebrew package manager
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

# Install Ansible via Homebrew
brew install ansible

# Give Ansible the community packages we need
ansible-galaxy install -r ansible-roles.yml
ansible-playbook --ask-become-pass ansible-playbook-essentials.yml

# TODO Move these inside Ansible
stow neovim
stow zsh

# Print a message on completion
echo "bootstrap.sh finished"
