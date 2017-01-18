#!/bin/bash

if [ -f ~/.aliasrc ]; then rm ~/.aliasrc; fi
ln -s ~/.dotfiles/mac/.aliasrc ~/.aliasrc

if [ -f ~/.dockerrc ]; then rm ~/.dockerrc; fi
ln -s ~/.dotfiles/mac/.dockerrc ~/.dockerrc

if [ -f ~/.hyper.js ]; then rm ~/.hyper.js; fi
ln -s ~/.dotfiles/mac/.hyper.js ~/.hyper.js

if [ -f ~/.config/nvim/init.vim ]; then rm ~/.config/nvim/init.vim; fi
ln -s ~/.dotfiles/.vimrc ~/.config/nvim/init.vim

if [ -f ~/.purerc ]; then rm ~/.purerc; fi
ln -s ~/.dotfiles/mac/.purerc ~/.purerc

if [ -f ~/.vimrc ]; then rm ~/.vimrc; fi
ln -s ~/.dotfiles/.vimrc ~/.vimrc

if [ -f ~/.zshrc ]; then rm ~/.zshrc; fi
ln -s ~/.dotfiles/mac/.zshrc ~/.zshrc
