#!/usr/bin/env bash

# Source .functionsrc to get access to the ruler function
# shellcheck disable=SC1091
source zsh/.functionsrc

# Install the Homebrew package manager
case $(uname -s) in
Darwin*)
	# Mac
	ruler "Installing Homebrew for macOS"
	yes "" | /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
  ;;
*)
	# Linux (WSL included)
	ruler "Updating packages via apt-get"
	sudo apt-get update
	sudo apt-get full-upgrade -y
	sudo apt-get autoremove -y
	ruler "Installing Linuxbrew dependencies via apt-get"
	sudo apt-get install -y build-essential curl file git
	ruler "Installing Linuxbrew"
	/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
	ruler "Temporarily putting Linuxbrew in PATH"
	eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
  ;;
esac

# Install Ansible via Homebrew
ruler "Installing ansible with brew"
brew install ansible
brew upgrade ansible
ruler "Forcing a Python keg link"
brew link python@3.8 --overwrite --force

# Run the playbooks
ruler "Running ansible-playbook-main.yml"
ansible-playbook ansible-playbook-main.yml

# Print a message on completion
ruler "bootstrap.sh finished; run any os-specific bootstrap.sh scripts and then reboot"
