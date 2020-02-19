#!/usr/bin/env bash

function ruler {
	printf '\n%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
	echo -e "$1"
	printf '%*s\n\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
}

# Install the Homebrew package manager
case $(uname -s) in
Darwin*)
	# Mac
	ruler "Installing Homebrew for macOS"
  yes "" | /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
  ;;
*)
	# Linux (WSL included)
	ruler "Updating packages via apt"
	sudo apt update
	sudo apt full-upgrade -y
	ruler "Installing Linuxbrew dependencies via apt"
	sudo apt install -y build-essential curl file git
	ruler "Installing Linuxbrew"
	yes "" | sh -c "$(curl -fsSL https://raw.githubusercontent.com/Linuxbrew/install/master/install.sh)"
	# Put Homebrew in the PATH until the script can do it in a more permanent way
	eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
  ;;
esac

# Install Ansible via Homebrew
ruler "Installing ansible with brew"
brew install ansible
brew upgrade ansible

# Run the playbooks
ruler "Running ansible-playbook-main.yml"
ansible-playbook ansible-playbook-main.yml

# Print a message on completion
ruler "bootstrap.sh finished; run any os-specific bootstrap.sh scripts and then reboot"
