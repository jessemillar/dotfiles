#!/usr/bin/env bash

git clone https://github.com/jessemillar/dotfiles.git || exit
mv dotfiles .dotfiles
mkdir projects || true
cd .dotfiles || exit
./bootstrap.sh
git remote set-url origin git@github.com:jessemillar/dotfiles.git
