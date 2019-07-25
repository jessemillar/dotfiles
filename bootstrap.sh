#!/usr/bin/env bash

# TODO Use Ansible for installing applications
# TODO Maybe use Stow inside Ansible

# Install the Homebrew package manager
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

# Install Ansible via Homebrew
brew install ansible
ansible --version

# Set up dotfile symlinks via GNU Stow
stow ack
stow bitbar
stow git
stow hammerspoon
stow intellij-idea
stow karabiner
stow kitty
stow neovim
stow skhd
stow visual-studio-code
stow yabai
stow zsh

# Print a message on completion
echo "bootstrap.sh finished"
