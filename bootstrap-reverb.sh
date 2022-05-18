#!/usr/bin/env bash

rm reverb-linux-amd64 || true
curl -OL https://github.com/jessemillar/reverb/releases/latest/download/reverb-linux-amd64
chmod +x reverb-linux-amd64
# Copy instead of move since building the Docker container depends on the binary still existing in this spot
sudo cp reverb-linux-amd64 /usr/local/bin/reverb
