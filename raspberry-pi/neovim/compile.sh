#!/usr/bin/env bash

source ~/.dotfiles/zsh/.functionsrc

ruler "Install dependencies"
sudo apt update
sudo apt install -y ninja-build gettext libtool libtool-bin autoconf automake cmake g++ pkg-config unzip

ruler "Clone the Neovim repo"
git clone https://github.com/neovim/neovim.git
mv neovim "$HOME/.neovim"
cd "$HOME/.neovim" || exit
git checkout stable

ruler "Compile"
make

ruler "Link the binary to ~/.bin for easy CLI access"
ln -s ~/.neovim/build/bin/nvim ~/.bin
