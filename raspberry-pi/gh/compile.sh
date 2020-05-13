#!/usr/bin/env bash

git clone https://github.com/cli/cli.git ~/.githubcli
cd ~/.githubcli && make
ln -s ~/.githubcli/bin/gh ~/.bin
