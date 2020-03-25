#!/usr/bin/env bash

# For anyone attempting to use this script to compile Aseprite, please note a few things specific to my setup:
# 1. I have ~/.bin added to my PATH

# See https://github.com/aseprite/aseprite/issues/1735 for info on compiling issues

# Install dependencies
sudo apt update
sudo apt install -y g++ cmake ninja-build libharfbuzz-dev libx11-dev libxcursor-dev libgl1-mesa-dev libfontconfig1-dev clang

# Create the directory we'll clone dependencies into
mkdir "$HOME"/.aseprite-deps
cd "$HOME"/.aseprite-deps || exit

# Install gn
git clone https://gn.googlesource.com/gn
cd gn || exit
python build/gen.py
ninja -C out
ln -s ~/.aseprite-deps/gn/out/gn ~/.bin/gn
cd ..

# Install Skia library
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
git clone -b aseprite-m81 https://github.com/aseprite/skia.git
export PATH="${PATH}:${PWD}/depot_tools"
cd skia || exit
python tools/git-sync-deps
gn gen out/Release-x64 --args="is_debug=false is_official_build=true skia_use_system_expat=false skia_use_system_icu=false skia_use_system_libjpeg_turbo=false skia_use_system_libpng=false skia_use_system_libwebp=false skia_use_system_zlib=false"
ninja -C out/Release-x64 skia modules
cd ..

# Clone the Aseprite repo
git clone --recursive https://github.com/aseprite/aseprite.git

# Update existing pull
# TODO Make the script smart enough to update
# cd aseprite
# git pull
# git submodule update --init --recursive

cd aseprite || exit
mkdir build
cd build || exit
cmake \
  -DCMAKE_BUILD_TYPE=RelWithDebInfo \
  -DLAF_BACKEND=skia \
  -DSKIA_DIR="$HOME"/.aseprite-deps/skia \
	-DUSE_SHARED_CURL=yes \
  -DSKIA_LIBRARY_DIR="$HOME"/.aseprite-deps/skia/out/Release-x64 \
  -G Ninja \
  ..
ninja aseprite

# Put the binary in the start menu for easy access
sudo ln -s ~/.dotfiles/raspberry-pi/aseprite/Aseprite.desktop /usr/share/applications
lxpanelctl restart

# Link the binary to ~/.bin for easy CLI access
ln -s ~/.aseprite-deps/aseprite/build/bin/aseprite ~/.bin
