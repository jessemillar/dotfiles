#!/usr/bin/env bash

source ~/.dotfiles/zsh/.functionsrc

ruler "Installing deps"
sudo apt update
sudo apt install -y debhelper autotools-dev protobuf-compiler libprotobuf-dev dh-autoreconf pkg-config libutempter-dev zlib1g-dev libncurses5-dev libssl-dev bash-completion locales

ruler "Cloning repo"
git clone https://github.com/mobile-shell/mosh
mv mosh "$HOME/.mosh"
cd "$HOME/.mosh" || exit

ruler "Configuring"
./autogen.sh
./configure

ruler "Compiling"
make

ruler "Installing"
make install
