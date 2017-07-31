#!/bin/bash

rm ~/.aliasrc
ln -s ~/.dotfiles/.aliasrc ~/.aliasrc

rm ~/.vimrc
ln -s ~/.dotfiles/.vimrc ~/.vimrc

rm ~/.zshrc
ln -s ~/.dotfiles/.zshrc ~/.zshrc

rm ~/.hyper.js
ln -s ~/.dotfiles/.hyper.js ~/.hyper.js

rm ~/.oh-my-zsh/custom/mister-michael.zsh-theme
ln -s ~/.dotfiles/.oh-my-zsh/custom/mister-michael.zsh-theme ~/.oh-my-zsh/custom/mister-michael.zsh-theme

rm -rf ~/.vim/colors
ln -s ~/.dotfiles/.vim/colors ~/.vim/colors

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
