#!/bin/bash

for i in {0..9}
do
	skhd -k "cmd + alt - ${i}"
	sleep 1
	wallpaper set ~/Documents/Trunk/wallpaper/randomized
done
