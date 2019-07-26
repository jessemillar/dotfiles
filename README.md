# dotfiles
## Overview
This repo represents all my dotfiles and application configurations. I use and maintain this repo for a couple reasons:
1. Syncing configs between workstations
1. Quickly setting up a new machine from scratch

## Usage
1. Clone/download this repo
1. Run `./bootstrap.sh`

## Manual Steps
### General
1. Install Aseprite from Humble Bundle

### Ansible
There are a few Ansible playbooks included in the repo that are not called as part of `bootstrap.sh`. Depending on which machine I'm configuring, I'll manually run one (or all) of the below playbooks via `ansible-playbook --ask-become-pass PLAYBOOK`.
- `ansible-playbook-personal.yml` (my work laptop doesn't allow certain applications to be installed)
- `ansible-playbook-work.yml`

## TODO
- [ ] Set up testing with Travis
