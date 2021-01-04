#!/usr/bin/env bash

# Source .functionsrc to get access to the ruler function
# shellcheck disable=SC1091
source zsh/.functionsrc

# Install Ansible via Homebrew
ruler "Installing ansible with brew"
brew install ansible
