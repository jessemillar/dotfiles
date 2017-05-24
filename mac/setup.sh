#!/bin/bash

rm ~/.aliasrc
ln -s ~/.dotfiles/.aliasrc ~/.aliasrc

rm ~/.vimrc
ln -s ~/.dotfiles/.vimrc ~/.vimrc

rm ~/.gitconfig
ln -s ~/.dotfiles/.gitconfig ~/.gitconfig

rm ~/.zshrc
ln -s ~/.dotfiles/.zshrc ~/.zshrc

rm ~/.hyper.js
ln -s ~/.dotfiles/mac/.hyper.js ~/.hyper.js

rm ~/.oh-my-zsh/custom/mister-michael.zsh-theme
ln -s ~/.dotfiles/.oh-my-zsh/custom/mister-michael.zsh-theme ~/.oh-my-zsh/custom/mister-michael.zsh-theme

rm -rf ~/.vim/colors
ln -s ~/.dotfiles/.vim/colors ~/.vim/colors

rm -rf ~/.hammerspoon
ln -s ~/.dotfiles/mac/.hammerspoon ~/.hammerspoon

rm ~/.functionsrc
ln -s ~/.dotfiles/.functionsrc ~/.functionsrc
