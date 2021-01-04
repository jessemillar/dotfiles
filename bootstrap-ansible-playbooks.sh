#!/usr/bin/env bash

# Run the playbooks with debug printing
reverb "Running ansible-playbook-main.yml"
ansible-playbook -vvv ansible-playbook-main.yml
