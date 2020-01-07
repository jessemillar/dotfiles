# Path to your oh-my-zsh installation
export ZSH=~/.oh-my-zsh

# Put Homebrew in my PATH
eval $($(brew --prefix)/bin/brew shellenv)

# Put Go in my PATH
export GOPATH="$HOME/.go"
export PATH="$GOPATH/bin:$PATH"
# Enable Go modules
export GO111MODULE=on

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
eval "$(thefuck --alias)"

# Load plugins
plugins=(docker docker-compose emoji golang kubectl wd vi-mode)

source $ZSH/oh-my-zsh.sh

# Print a random logo
printAscii

# Start Starship
eval "$(starship init zsh)"
