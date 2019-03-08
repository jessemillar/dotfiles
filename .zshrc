# Path to your oh-my-zsh installation
export ZSH=~/.oh-my-zsh
source <(antibody init)

# Set the prompt theme
ZSH_THEME="mister-michael"

# Makes repository status check for large repositories much, much faster
DISABLE_UNTRACKED_FILES_DIRTY="true"

# Make NVM load in a way that doesn't slow down terminal startup
NVM_LAZY_LOAD=true

# Put Homebrew's sbin in my path
export PATH="/usr/local/sbin:$PATH"

# Put Go in my path
export GOPATH="$HOME/.go"
export PATH="$GOPATH/bin:$PATH"

# Enable the itch.io butler
export PATH="~/Library/Application\ Support/itch/apps/butler:$PATH"

# Remove duplicates from $PATH
typeset -aU path

# Load proxy information
[ -f ~/.proxyrc ] && source ~/.proxyrc

# Load environment variables
[ -f ~/.envrc ] && source ~/.envrc

# Load Docker environment variables
[ -f ~/.dockerrc ] && source ~/.dockerrc

# Load custom aliases
[ -f ~/.aliasrc ] && source ~/.aliasrc

# Load custom functions
[ -f ~/.functionsrc ] && source ~/.functionsrc

# Load custom functions for ASCII art
[ -f ~/.asciirc ] && source ~/.asciirc

# Load various CLI helpers
eval "$(hub alias -s)"
eval "$(thefuck --alias)"

# Load plugins
plugins=(wd vi-mode)
antibody bundle lukechilds/zsh-nvm

source $ZSH/oh-my-zsh.sh

# Print a random logo
LOGOS=("sombra" "compycore" "walmartlabs")
$(shuf -n1 -e "${LOGOS[@]}")
