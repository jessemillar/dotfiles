#!/usr/bin/env bash

# Install the Homebrew package manager
case $(uname -s) in
Darwin*)
	# Mac
	reverb "Installing Homebrew"
	yes "" | /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
  ;;
*)
	# Linux (WSL included)
	reverb "Updating packages via apt-get"
	sudo apt-get update
	sudo apt-get upgrade -y
	sudo apt-get autoremove -y
	reverb "Installing Homebrew dependencies via apt-get"
	sudo apt-get install -y build-essential curl file git
	reverb "Installing Homebrew"
	# Install Homebrew without user interaction
	export NONINTERACTIVE=true
	/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
	reverb "Temporarily putting Homebrew in PATH"
	eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
  ;;
esac
