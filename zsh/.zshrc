# Path to your oh-my-zsh installation
export ZSH=~/.oh-my-zsh

# Put Go in my PATH
export GOPATH="$HOME/.go"
export PATH="$GOPATH/bin:$PATH"
# Enable Go modules
export GO111MODULE=on

# Load various CLI helpers
eval "$(thefuck --alias)"

# Load plugins
plugins=(docker docker-compose emoji golang kubectl wd vi-mode)

source $ZSH/oh-my-zsh.sh

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

# Print a random logo
printAscii

# Start Starship
eval "$(starship init zsh)"
