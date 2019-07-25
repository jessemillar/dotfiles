#!/usr/bin/env bash

# TODO Use Ansible for installing applications
# TODO Use GNU Stow to create symlinks
# TODO Figure out how to keep Ansible updated

# Install pip, the Python package manager
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python get-pip.py --user

# Install Ansible via pip
pip install --user ansible
