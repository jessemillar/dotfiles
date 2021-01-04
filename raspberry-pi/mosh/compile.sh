#!/usr/bin/env bash

# shellcheck disable=SC1090
source ~/.dotfiles/zsh/.functionsrc

reverb "Installing deps"
sudo apt update
sudo apt install -y debhelper autotools-dev protobuf-compiler libprotobuf-dev dh-autoreconf pkg-config libutempter-dev zlib1g-dev libncurses5-dev libssl-dev bash-completion locales

reverb "Cloning repo"
git clone https://github.com/mobile-shell/mosh
mv mosh "$HOME/.mosh"
cd "$HOME/.mosh" || exit

reverb "Configuring"
./autogen.sh
./configure

reverb "Compiling"
make

reverb "Installing"
sudo make install
