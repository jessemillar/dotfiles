#!/usr/bin/env bash

rm reverb-linux-amd64 || true
curl -OL https://github.com/jessemillar/reverb/releases/latest/download/reverb-linux-amd64
docker build -t jessemillar/dotfiles:latest .
