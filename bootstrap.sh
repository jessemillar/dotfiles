#!/usr/bin/env bash

# Install the Homebrew package manager
case $(uname -s) in
Darwin*)
	# Mac
  yes "" | /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
  ;;
*)
	# Linux (WSL included)
	sudo apt update
	sudo apt upgrade -y
	sudo apt install -y build-essential curl file git
	yes "" | sh -c "$(curl -fsSL https://raw.githubusercontent.com/Linuxbrew/install/master/install.sh)"
	# Put Homebrew in the PATH until the script can do it in a more permanent way
	eval $(/home/linuxbrew/.linuxbrew/bin/brew shellenv)
  ;;
esac

# Install Ansible via Homebrew
brew install ansible

# Run the playbooks
ansible-playbook ansible-playbook-main.yml

# Print a message on completion
echo -e "bootstrap.sh finished\nRun any os-specific bootstrap.sh scripts and then reboot"
