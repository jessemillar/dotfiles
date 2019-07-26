#!/usr/bin/env bash

# TODO Use Ansible for installing applications
# TODO Maybe use Stow inside Ansible

# Make sure we've got Apple's command line tools
xcode-select --install
sudo xcodebuild -license accept

# Install the Homebrew package manager
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

# Install Ansible via Homebrew
brew install ansible
ansible --version

# Give Ansible the community packages we need
ansible-galaxy install -r ansible-galaxy-requirements.yml

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
