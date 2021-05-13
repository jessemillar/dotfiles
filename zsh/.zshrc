#!/usr/bin/env bash
# shellcheck disable=SC1090,SC2039

# Path to your oh-my-zsh installation
export ZSH=~/.oh-my-zsh

# Load plugins
# shellcheck disable=SC2034,SC2039
plugins=(docker docker-compose fzf kubectl tmux vi-mode wd)

# Load up Oh My Zsh
# shellcheck disable=SC1091
source $ZSH/oh-my-zsh.sh

# Enable autocomplete for hidden files
setopt globdots

# Let Zsh prevent me from being an idiot and typing the wrong things over and over
setopt correct

# Enable the mass-rename zmv tool
autoload -U zmv

# Disable Control + Z because I always hit it accidentally when trying to zoom a tmux pane
set +m

# Don't trust the cache of binaries to make installation of new programs slightly easier at the cost of performance
zstyle ":completion:*:commands" rehash 1

# Use fzf for tab completion
# shellcheck disable=SC1091
source "$HOME/.fzf-tab-completion/zsh/fzf-zsh-completion.sh"

# Load environment variables for development secrets
[ -f ~/.envrc ] && source ~/.envrc

# Load custom aliases
[ -f ~/.aliasrc ] && source ~/.aliasrc

# Load custom functions
[ -f ~/.functionsrc ] && source ~/.functionsrc

# Enable fzf fuzzy completion
[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh

# Load custom functions for ASCII art
[ -f ~/.asciirc ] && source ~/.asciirc

# Load GVM so I can use older versions of Go
# shellcheck disable=SC1091
[[ -s "$HOME/.gvm/scripts/gvm" ]] && source "$HOME/.gvm/scripts/gvm"

# Print a random logo
printAscii

# Start Starship
eval "$(starship init zsh)"
