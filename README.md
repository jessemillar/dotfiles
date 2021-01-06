# dotfiles

[![Build Status](https://github.com/jessemillar/dotfiles/workflows/build%20status/badge.svg)](https://github.com/jessemillar/dotfiles/actions) [![Man Hours](https://img.shields.io/endpoint?url=https%3A%2F%2Fmh.jessemillar.com%2Fhours%3Frepo%3Dhttps%3A%2F%2Fgithub.com%2Fjessemillar%2Fdotfiles.git)](https://jessemillar.com/r/man-hours) [![Docker Pulls](https://img.shields.io/docker/pulls/jessemillar/dotfiles.svg)](https://hub.docker.com/repository/docker/jessemillar/dotfiles)

[![Deploy to Azure](https://img.shields.io/badge/deploy-to%20azure-blue?style=for-the-badge&logo=microsoft-azure)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fjessemillar%2Fdotfiles%2Fmaster%2Fazuredeploy.json)

## Overview

This repo contains all my dotfiles and application configurations. I use and maintain this repo for a couple reasons:
1. Quickly setting up new machines from scratch
1. Syncing configs between workstations

I utilize a combination of [GNU Stow](https://www.gnu.org/software/stow/) and [Ansible](https://www.ansible.com/) to manage my setups. Stow quickly creates symlinks between this repo and my home directory without the need for maintaining manual scripts. Ansible uses human-readable `.yml` configuration files to install applications and development dependencies in a reproducible way.

## Usage

1. Make sure your current user has `sudo` permissions (either has a password or is marked as `NOPASSWD` in `/etc/passwd`)
1. Run the following commands:

	```
	git clone https://github.com/jessemillar/dotfiles.git
	mv dotfiles ~/.dotfiles
	cd ~/.dotfiles
	./bootstrap.sh
	```

1. Follow "Manual Steps" below

## Manual Steps

### General

1. Put necessary workstation SSH keys in `~/.ssh/authorized_keys`
1. Upload `~/.ssh/id_rsa.pub` to GitHub
1. Change the remote URL of local copy of the dotfiles repo to use SSH instead of HTTPS:

	```
	git remote set-url origin git@github.com:jessemillar/dotfiles.git
	```

1. Run workstation-specific Ansible playbooks (e.g. `ansible-playbook-work.yml`)
1. Install Aseprite from Humble Bundle or via code compilation

### Ansible

`ansible-playbook-main.yml` is a combination of multiple playbooks that get my system up to speed quickly with minimal user interaction. There are a few Ansible playbooks included in the repo that are not called as part of `ansible-playbook-main.yml`. Depending on which machine I'm configuring, I'll manually run one (or all) of the non-included playbooks via `ansible-playbook PLAYBOOK` after the successful completion of `ansible-playbook-main.yml`.

## Notes

I'm most comfortable with Unix systems and mostly use Unix systems. That said, this repo is assumed to be Unix-centric with the exception of the [`/windows`](windows) directory.
