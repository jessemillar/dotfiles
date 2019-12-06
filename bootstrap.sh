#!/usr/bin/env bash

# Install the Homebrew package manager
case $(uname -s) in
Darwin*)
	# Mac
  yes "" | /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
  ;;
*)
	# Linux (WSL included)
	sudo apt update && sudo apt upgrade -y
	sudo apt install -y build-essential curl file git
	yes "" | sh -c "$(curl -fsSL https://raw.githubusercontent.com/Linuxbrew/install/master/install.sh)"
  ;;
esac

# Install Ansible via Homebrew
brew install ansible

# Give Ansible the community packages we need
ansible-playbook ansible-playbook-main.yml -vvvv

# Print a message on completion
echo "bootstrap.sh finished"
