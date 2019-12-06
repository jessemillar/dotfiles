#!/usr/bin/env bash

# Install the Homebrew package manager
case $(uname -s) in
Darwin*)
	# Mac
  /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
  ;;
*)
	# Linux (WSL included)
	sudo apt install build-essential curl file git
	sh -c "$(curl -fsSL https://raw.githubusercontent.com/Linuxbrew/install/master/install.sh)"
  ;;
esac

# Install Ansible via Homebrew
brew install ansible

# Give Ansible the community packages we need
ansible-playbook --ask-become-pass ansible-playbook-main.yml

# Print a message on completion
echo "bootstrap.sh finished"
