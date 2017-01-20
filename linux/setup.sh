#!/bin/bash

if [ -f ~/.aliasrc ]; then rm ~/.aliasrc; fi
ln -s ~/.dotfiles/linux/.aliasrc ~/.aliasrc

if [ -f ~/.vimrc ]; then rm ~/.vimrc; fi
ln -s ~/.dotfiles/.vimrc ~/.vimrc

if [ -f ~/.Xdefaults ]; then rm ~/.Xdefaults; fi
ln -s ~/.dotfiles/linux/.Xdefaults ~/.Xdefaults

if [ -d ~/.config/i3 ]; then rm -rf ~/.config/i3; fi
ln -s ~/.dotfiles/linux/.config/i3 ~/.config/i3

if [ -f ~/.config/gtk-3.0/gtk.css ]; then rm ~/.config/gtk-3.0/gtk.css; fi
ln -s ~/.dotfiles/linux/.config/gtk-3.0/gtk.css ~/.config/gtk-3.0/gtk.css

if [ -f ~/.purerc ]; then rm ~/.purerc; fi
ln -s ~/.dotfiles/.purerc ~/.purerc

if [ -d ~/.config/polybar ]; then rm -rf ~/.config/polybar; fi
ln -s ~/.dotfiles/linux/.config/polybar ~/.config/polybar

if [ -f ~/.zshrc ]; then rm ~/.zshrc; fi
ln -s ~/.dotfiles/linux/.zshrc ~/.zshrc