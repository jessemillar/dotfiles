#!/bin/bash

rm ~/.aliasrc
ln -s ~/.dotfiles/.aliasrc ~/.aliasrc

rm ~/.vimrc
ln -s ~/.dotfiles/.vimrc ~/.vimrc

rm ~/.Xdefaults
ln -s ~/.dotfiles/.Xdefaults ~/.Xdefaults

rm ~/.gitconfig
ln -s ~/.dotfiles/.gitconfig ~/.gitconfig

rm ~/.zshrc
ln -s ~/.dotfiles/.zshrc ~/.zshrc

rm ~/.oh-my-zsh/custom/mister-michael.zsh-theme
ln -s ~/.dotfiles/.oh-my-zsh/custom/mister-michael.zsh-theme ~/.oh-my-zsh/custom/mister-michael.zsh-theme

rm -rf ~/.vim/colors
ln -s ~/.dotfiles/.vim/colors ~/.vim/colors

rm ~/.functionsrc
ln -s ~/.dotfiles/.functionsrc ~/.functionsrc

rm -rf ~/.config/bspwm
ln -s ~/.dotfiles/personal/.config/bspwm ~/.config

rm -rf ~/.config/sxhkd
ln -s ~/.dotfiles/personal/.config/sxhkd ~/.config

sudo rm /etc/X11/xorg.conf.d/10-mtrack.conf
sudo ln -s ~/.dotfiles/etc/X11/xorg.conf.d/10-mtrack.conf /etc/X11/xorg.conf.d/10-mtrack.conf

sudo rm /etc/X11/xorg.conf.d/10-mouse.conf
sudo ln -s ~/.dotfiles/etc/X11/xorg.conf.d/10-mouse.conf /etc/X11/xorg.conf.d/10-mouse.conf

sudo rm /etc/systemd/system/sedate.service
sudo ln -s ~/.dotfiles/etc/systemd/system/sedate.service /etc/systemd/system/sedate.service