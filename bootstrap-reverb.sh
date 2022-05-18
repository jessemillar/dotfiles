#!/usr/bin/env bash

rm reverb-linux-amd64 || true
curl -OL https://github.com/jessemillar/reverb/releases/latest/download/reverb-linux-amd64
chmod +x reverb-linux-amd64
sudo mv reverb-linux-amd64 /usr/local/bin/reverb
