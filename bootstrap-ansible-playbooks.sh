#!/usr/bin/env bash

# Run the playbooks with debug printing
ruler "Running ansible-playbook-main.yml"
ansible-playbook -vvv ansible-playbook-main.yml
