#!/bin/bash

rm ~/.aliasrc
ln -s ~/.dotfiles/.aliasrc ~/.aliasrc

rm ~/.vimrc
ln -s ~/.dotfiles/.vimrc ~/.vimrc

rm ~/.Xdefaults
ln -s ~/.dotfiles/.Xdefaults ~/.Xdefaults

rm -rf ~/.config/i3
ln -s ~/.dotfiles/work/.config/i3 ~/.config/i3

rm ~/.gitconfig
ln -s ~/.dotfiles/.gitconfig ~/.gitconfig

rm -rf ~/.config/polybar
ln -s ~/.dotfiles/work/.config/polybar ~/.config/polybar

rm ~/.zshrc
ln -s ~/.dotfiles/.zshrc ~/.zshrc

rm ~/.oh-my-zsh/custom/mister-michael.zsh-theme
ln -s ~/.dotfiles/.oh-my-zsh/custom/mister-michael.zsh-theme ~/.oh-my-zsh/custom/mister-michael.zsh-theme

rm -rf ~/.vim/colors
ln -s ~/.dotfiles/.vim/colors ~/.vim/colors

rm ~/.functionsrc
ln -s ~/.dotfiles/.functionsrc ~/.functionsrc

rm -rf ~/.config/bspwm
ln -s ~/.dotfiles/.config/bspwm ~/.config

rm -rf ~/.config/sxhkd
ln -s ~/.dotfiles/.config/sxhkd ~/.config

sudo rm /etc/X11/xorg.conf.d/10-mouse.conf
sudo ln -s ~/.dotfiles/etc/X11/xorg.conf.d/10-mouse.conf /etc/X11/xorg.conf.d/10-mouse.conf
