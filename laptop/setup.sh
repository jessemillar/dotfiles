#!/bin/bash

sudo rm /etc/X11/xorg.conf.d/10-trackpad.conf
sudo ln -s ~/.dotfiles/etc/X11/xorg.conf.d/10-trackpad.conf /etc/X11/xorg.conf.d/10-trackpad.conf

sudo rm /etc/systemd/system/sedate.service
sudo ln -s ~/.dotfiles/etc/systemd/system/sedate.service /etc/systemd/system/sedate.service

sudo rm /etc/acpi/handler.sh
sudo ln -s ~/.dotfiles/etc/acpi/handler.sh /etc/acpi/handler.sh

sudo rm /etc/systemd/system/lemonbattery.service
sudo ln -s ~/.dotfiles/etc/systemd/system/lemonbattery.service /etc/systemd/system/lemonbattery.service

sudo rm /etc/systemd/system/lemonbattery.timer
sudo ln -s ~/.dotfiles/etc/systemd/system/lemonbattery.timer /etc/systemd/system/lemonbattery.timer

sudo rm /etc/systemd/system/powertop.service
sudo ln -s ~/.dotfiles/etc/systemd/system/powertop.service /etc/systemd/system/powertop.service

systemctl daemon-reload
