#!/bin/bash

rm ~/.ackrc
ln -s ~/.dotfiles/.ackrc ~/.ackrc

rm ~/.alacritty.yml
ln -s ~/.dotfiles/.alacritty.yml ~/.alacritty.yml

rm ~/.aliasrc
ln -s ~/.dotfiles/.aliasrc ~/.aliasrc

rm ~/.chunkwmrc
ln -s ~/.dotfiles/.chunkwmrc ~/.chunkwmrc

rm -rf ~/.config/karabiner
ln -s ~/.dotfiles/.config/karabiner ~/.config/karabiner

rm -rf ~/.config/kitty
ln -s ~/.dotfiles/.config/kitty ~/.config/kitty

rm -rf ~/.config/nvim
ln -s ~/.dotfiles/.config/nvim ~/.config/nvim

rm ~/.cvimrc
ln -s ~/.dotfiles/.cvimrc ~/.cvimrc

rm ~/.functionsrc
ln -s ~/.dotfiles/.functionsrc ~/.functionsrc

rm ~/.gitignore_global
ln -s ~/.dotfiles/.gitignore_global ~/.gitignore_global
git config --global core.excludesfile ~/.gitignore_global

rm -rf ~/.hammerspoon
ln -s ~/.dotfiles/.hammerspoon ~/.hammerspoon

rm ~/.ideavimrc
ln -s ~/.dotfiles/.ideavimrc ~/.ideavimrc

rm -rf ~/.khdrc
ln -s ~/.dotfiles/.khdrc ~/.khdrc

rm ~/.oh-my-zsh/custom/mister-michael.zsh-theme
mkdir -p ~/.oh-my-zsh/custom
ln -s ~/.dotfiles/.oh-my-zsh/custom/mister-michael.zsh-theme ~/.oh-my-zsh/custom/mister-michael.zsh-theme

rm ~/.warprc
ln -s ~/.dotfiles/.warprc ~/.warprc

rm ~/.zshrc
ln -s ~/.dotfiles/.zshrc ~/.zshrc

