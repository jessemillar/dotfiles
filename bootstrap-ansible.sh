#!/usr/bin/env bash

# Install Ansible via Homebrew
reverb "Installing Ansible dependencies via apt-get"
sudo apt-get install -y python3
reverb "Installing Ansible with brew"
brew install ansible
