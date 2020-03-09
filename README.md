# dotfiles

[![Build Status](https://travis-ci.org/jessemillar/dotfiles.svg?branch=master)](https://travis-ci.org/jessemillar/dotfiles) [![Deploy to Azure](https://img.shields.io/badge/deploy-to%20azure-blue)](https://azuredeploy.net/)

## Overview

This repo contains all my dotfiles and application configurations. I use and maintain this repo for a couple reasons:
1. Quickly setting up new machines from scratch
1. Syncing configs between workstations

I utilize a combination of [GNU Stow](https://www.gnu.org/software/stow/) and [Ansible](https://www.ansible.com/) to manage my setups. Stow quickly creates symlinks between this repo and my home directory without the need for maintaining manual scripts. Ansible uses human-readable `.yml` configuration files to install applications and development dependencies in a reproducible way.

## Usage

1. Clone/download this repo
1. Make sure your current user has `sudo` permissions (either has a password or is marked as `NOPASSWD` in `/etc/passwd`)
1. Run `./bootstrap.sh`
1. Follow "Manual Steps" below

## Manual Steps

### General

1. Put necessary workstation SSH keys in `~/.ssh/authorized_keys`
1. Upload `~/.ssh/id_rsa.pub` to GitHub
1. Install Aseprite from Humble Bundle or via code compilation

### Ansible

`ansible-playbook-main.yml` is a combination of multiple playbooks that get my system up to speed quickly with minimal user interaction. There are a few Ansible playbooks included in the repo that are not called as part of `ansible-playbook-main.yml`. Depending on which machine I'm configuring, I'll manually run one (or all) of the non-included playbooks via `ansible-playbook PLAYBOOK` after the successful completion of `ansible-playbook-main.yml`.

## Notes

I'm most comfortable with Unix systems and mostly use Unix systems. That said, this repo is assumed to be Unix-centric with the exception of the [`/windows`](windows) directory.
