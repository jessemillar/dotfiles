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
	# TODO Uncomment these lines
	# sudo apt-get full-upgrade -y
	# sudo apt-get autoremove -y
	ruler "Installing Homebrew dependencies via apt-get"
	sudo apt-get install -y build-essential curl file git
	ruler "Installing Homebrew for Linux"
	/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
	ruler "Temporarily putting Homebrew in PATH"
	eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
  ;;
esac
