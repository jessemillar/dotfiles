#!/usr/bin/env bash

./bootstrap-reverb.sh
docker build -t jessemillar/dotfiles:latest .
