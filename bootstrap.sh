#!/usr/bin/env bash

# Make sure we've got Apple's command line tools
xcode-select --install
sudo xcodebuild -license accept

# Install the Homebrew package manager
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

# Install Ansible via Homebrew
brew install ansible

# Give Ansible the community packages we need
ansible-galaxy install -r ansible-galaxy-requirements.yml

# TODO Move these inside Ansible
stow neovim
stow zsh

# Print a message on completion
echo "bootstrap.sh finished"
