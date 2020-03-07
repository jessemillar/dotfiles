#!/usr/bin/env bash

# See https://github.com/aseprite/aseprite/issues/1735

# Install dependencies
sudo apt-get install -y g++ cmake ninja-build libx11-dev libxcursor-dev libgl1-mesa-dev libfontconfig1-dev
sudo apt install clang

# Install gn
git clone https://gn.googlesource.com/gn
cd gn || exit
python build/gen.py
ninja -C out

# Install Skia library
mkdir $HOME/.deps
cd $HOME/.deps
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
git clone -b aseprite-m81 https://github.com/aseprite/skia.git
export PATH="${PATH}:${PWD}/depot_tools"
cd skia
python tools/git-sync-deps
gn gen out/Release-x64 --args="is_debug=false is_official_build=true skia_use_system_expat=false skia_use_system_icu=false skia_use_system_libjpeg_turbo=false skia_use_system_libpng=false skia_use_system_libwebp=false skia_use_system_zlib=false"
ninja -C out/Release-x64 skia modules

git clone --recursive https://github.com/aseprite/aseprite.git

# Update existing pull
cd aseprite
git pull
git submodule update --init --recursive

cd aseprite
mkdir build
cd build
cmake \
  -DCMAKE_BUILD_TYPE=RelWithDebInfo \
  -DLAF_BACKEND=skia \
  -DSKIA_DIR=$HOME/deps/skia \
	-DUSE_SHARED_CURL=yes \
  -DSKIA_LIBRARY_DIR=$HOME/deps/skia/out/Release-x64 \
  -G Ninja \
  ..
ninja aseprite
