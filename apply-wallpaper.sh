#!/bin/bash

for i in {0..9}
do
	chunkc tiling::window -d $i
	skhd -k "cmd - ${i}"
	sleep 1
	wallpaper set ~/Documents/Trunk/wallpaper/randomized
done
