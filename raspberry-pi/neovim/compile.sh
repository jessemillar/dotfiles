#!/usr/bin/env bash

# shellcheck disable=SC1090
source ~/.dotfiles/zsh/.functionsrc

reverb "Install dependencies"
sudo apt update
sudo apt install -y ninja-build gettext libtool libtool-bin autoconf automake cmake g++ pkg-config unzip

reverb "Clone the Neovim repo"
git clone https://github.com/neovim/neovim.git
mv neovim "$HOME/.neovim"
cd "$HOME/.neovim" || exit
git checkout stable

reverb "Compile"
CMAKE_BUILD_TYPE=RelWithDebInfo make

reverb "Install"
sudo make install
