#!/usr/bin/env bash

# Exit when any command fails
set -e

# Source .functionsrc to get access to the ruler function
# shellcheck disable=SC1091
source zsh/.functionsrc

ruler "Checking for existing LÖVE"
if ! [ -x "$(command -v love)" ]
then
	ruler "Installing dependencies"
	sudo apt-get install -y build-essential autotools-dev automake libtool pkg-config libfreetype6-dev libluajit-5.1-dev libphysfs-dev libsdl2-dev libopenal-dev libogg-dev libvorbis-dev libmodplug-dev libmpg123-dev libtheora-dev
	cd
	ruler "Cloning repo"
	git clone https://github.com/love2d/love
	mv love .love
	cd .love
	git checkout 11.3
	./platform/unix/automagic
	./configure
	make
	ln -s ~/.love/src/love ~/.bin
fi

ruler "Done"
