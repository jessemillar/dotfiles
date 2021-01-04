#!/usr/bin/env bash

# Exit when any command fails
set -e

reverb "Checking for existing LÖVE"
if ! [ -x "$(command -v love)" ]
then
	reverb "Installing dependencies"
	sudo apt install -y build-essential autotools-dev automake libtool pkg-config libfreetype6-dev libluajit-5.1-dev libphysfs-dev libsdl2-dev libopenal-dev libogg-dev libvorbis-dev libmodplug-dev libmpg123-dev libtheora-dev
	cd
	reverb "Cloning repo"
	git clone https://github.com/love2d/love
	mv love .love
	cd .love
	reverb "Compiling version 11.3"
	git checkout 11.3
	./platform/unix/automagic
	./configure
	make
	reverb "Symlinking executable to ~/.bin"
	ln -s ~/.love/src/love ~/.bin
fi

reverb "Done"
)
