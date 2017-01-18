#!/bin/bash

if [ -f ~/.aliasrc ]; then rm ~/.aliasrc; fi
ln -s ~/.dotfiles/linux/.aliasrc ~/.aliasrc

if [ -f ~/.vimrc ]; then rm ~/.vimrc; fi
ln -s ~/.dotfiles/.vimrc ~/.vimrc

if [ -d ~/.config/i3 ]; then rm -rf ~/.config/i3; fi
ln -s ~/.dotfiles/linux/.config/i3 ~/.config/i3

if [ -d ~/.config/polybar ]; then rm -rf ~/.config/polybar; fi
ln -s ~/.dotfiles/linux/.config/polybar ~/.config/polybar
