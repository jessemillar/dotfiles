#!/usr/bin/env bash

sudo snap install tiled

# Put Tiled in the start menu for easy access
sudo ln -s ~/.dotfiles/raspberry-pi/tiled/Tiled.desktop /usr/share/applications
lxpanelctl restart
