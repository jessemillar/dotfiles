#!/usr/bin/env bash

# Run the playbooks with debug printing
reverb "Running ansible-playbook-main.yml"
export ANSIBLE_LOG_PATH=~/ansible.log
export ANSIBLE_DEBUG=True
ansible-playbook -vvv ansible-playbook-main.yml
