#!/usr/bin/env bash

git clone https://github.com/jessemillar/dotfiles.git || exit
mv dotfiles .dotfiles
cd .dotfiles || exit
./bootstrap.sh
