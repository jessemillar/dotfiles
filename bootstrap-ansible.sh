#!/usr/bin/env bash

# Install Ansible via Homebrew
reverb "Installing Ansible dependencies via apt-get"
sudo apt-get install -y python3

# prevent ERROR: Ansible could not initialize the preferred locale: unsupported locale setting
sudo locale-gen en_US.UTF-8
sudo update-locale LC_ALL="en_US.UTF-8"
echo "If you get an error about a 'unsupported locale setting' from Ansible, reboot and re-run ./bootstrap.sh"

reverb "Installing Ansible with brew"
brew install ansible
