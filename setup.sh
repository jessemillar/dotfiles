#!/bin/bash

rm ~/.aliasrc
ln -s ~/.dotfiles/.aliasrc ~/.aliasrc

rm ~/.vimrc
ln -s ~/.dotfiles/.vimrc ~/.vimrc

rm ~/.zshrc
ln -s ~/.dotfiles/.zshrc ~/.zshrc

rm ~/.hyper.js
ln -s ~/.dotfiles/.hyper.js ~/.hyper.js

rm -rf ~/.hammerspoon
ln -s ~/.dotfiles/.hammerspoon ~/.hammerspoon

rm -rf ~/.hammerspoon
ln -s ~/.dotfiles/.hammerspoon ~/.hammerspoon

rm ~/.functionsrc
ln -s ~/.dotfiles/.functionsrc ~/.functionsrc

rm -rf ~/.khdrc
ln -s ~/.dotfiles/.khdrc ~/.khdrc

rm ~/.chunkwmrc
ln -s ~/.dotfiles/.chunkwmrc ~/.chunkwmrc

rm ~/.gitignore_global
ln -s ~/.dotfiles/.gitignore_global ~/.gitignore_global
git config --global core.excludesfile ~/.gitignore_global

rm ~/.oh-my-zsh/custom/mister-michael.zsh-theme
mkdir -p ~/.oh-my-zsh/custom
ln -s ~/.dotfiles/.oh-my-zsh/custom/mister-michael.zsh-theme ~/.oh-my-zsh/custom/mister-michael.zsh-theme
