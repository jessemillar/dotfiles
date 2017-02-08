#!/bin/bash

rm ~/.aliasrc
ln -s ~/.dotfiles/linux/work/.aliasrc ~/.aliasrc

rm ~/.vimrc
ln -s ~/.dotfiles/.vimrc ~/.vimrc

rm ~/.Xdefaults
ln -s ~/.dotfiles/linux/.Xdefaults ~/.Xdefaults

rm -rf ~/.config/i3
ln -s ~/.dotfiles/linux/work/.config/i3 ~/.config/i3

rm ~/.gitconfig
ln -s ~/.dotfiles/linux/.gitconfig ~/.gitconfig

rm -rf ~/.config/polybar
ln -s ~/.dotfiles/linux/work/.config/polybar ~/.config/polybar

rm ~/.zshrc
ln -s ~/.dotfiles/linux/work/.zshrc ~/.zshrc

rm ~/.oh-my-zsh/custom/mister-michael.zsh-theme
ln -s ~/.dotfiles/.oh-my-zsh/custom/mister-michael.zsh-theme ~/.oh-my-zsh/custom/mister-michael.zsh-theme

rm -rf ~/.vim/colors
ln -s ~/.dotfiles/.vim/colors ~/.vim/colors

rm ~/.functionsrc
ln -s ~/.dotfiles/.functionsrc ~/.functionsrc

rm ~/.compton.conf
ln -s ~/.dotfiles/linux/.compton.conf ~/.compton.conf

rm -rf ~/.config/bspwm
ln -s ~/.dotfiles/linux/work/.config/bspwm ~/.config

rm -rf ~/.config/sxhkd
ln -s ~/.dotfiles/linux/work/.config/sxhkd ~/.config
