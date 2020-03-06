#!/usr/bin/env bash

git clone git@github.com:jessemillar/dotfiles.git
mv dotfiles .dotfiles
cd .dotfiles || exit
./bootstrap.sh
