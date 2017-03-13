#!/bin/bash

sudo rm /etc/X11/xorg.conf.d/10-mtrack.conf
sudo ln -s ~/.dotfiles/etc/X11/xorg.conf.d/10-mtrack.conf /etc/X11/xorg.conf.d/10-mtrack.conf

sudo rm /etc/systemd/system/sedate.service
sudo ln -s ~/.dotfiles/etc/systemd/system/sedate.service /etc/systemd/system/sedate.service
