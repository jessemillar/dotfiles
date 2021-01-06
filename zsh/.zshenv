#!/usr/bin/env bash

# Load up the Brew environment only if it exists
test -d /home/linuxbrew/.linuxbrew && eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"

# Go setup
export GOPATH="$HOME/.go"
export GOBIN="$GOPATH/bin"
export GOPRIVATE="goms.io"
export GO111MODULE=on
DELVE_EDITOR="$(which nvim)"
export DELVE_EDITOR

# Set Neovim as my terminal editor of choice
EDITOR="$(which nvim)"
export EDITOR

# Kubebuilder asset setup
export KUBEBUILDER_ASSETS="$HOME/.bin/"

# Manually specify the version of Kubernetes so Kind works (doesn't support the latest kubectl)
export KUBERNETES_VERSION=1.16.9

# Path config
PATH="$PATH:$GOPATH/bin"
PATH="$HOME/.bin:$PATH"

# Ruby Gems
export GEM_HOME="$HOME/.gems"
export PATH="$GEM_HOME/bin:$PATH"

# Automatically start tmux at login
export ZSH_TMUX_AUTOSTART=true
export ZSH_TMUX_AUTOQUIT=false

# Make tmux-yank work
export DISPLAY=:0

# Tell ripgrep where to look for global config flags
export RIPGREP_CONFIG_PATH="$HOME/.ripgreprc"

# Set default options for fzf
export FZF_DEFAULT_OPTS="--height 30% --border --bind alt-j:down,alt-k:up,tab:down,btab:up,alt-space:toggle"
export FZF_DEFAULT_COMMAND="fd --type file --hidden --follow --no-ignore-vcs --exclude .git"
export FZF_CTRL_T_COMMAND="$FZF_DEFAULT_COMMAND"

# Apply the Nord theme to fzf
export FZF_DEFAULT_OPTS=$FZF_DEFAULT_OPTS'
--color fg:-1,bg:-1,hl:#A3BE8C,fg+:#D8DEE9,bg+:#434C5E,hl+:#A3BE8C,border:#616E88
--color pointer:#BF616A,info:#4C566A,spinner:#4C566A,header:#4C566A,prompt:#81A1C1,marker:#EBCB8B
'

# Set the style to use with apps utilizing the Glamour rendering library
export GLAMOUR_STYLE="/home/jessemillar/.dotfiles/glow/nord.json"

# Use the Nord theme with bat and force truecolor support
export BAT_THEME="Nord"
export COLORTERM="truecolor"

# The port used for locally testing Heroku projects
export PORT="8080"
