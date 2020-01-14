# Path to your oh-my-zsh installation
export ZSH=~/.oh-my-zsh

# Load various CLI helpers
eval "$(thefuck --alias)"

# Load plugins
plugins=(wd vi-mode)

source $ZSH/oh-my-zsh.sh

# Don't trush the cache of binaries to make installation of new programs slightly easier at the cost of performance
zstyle ":completion:*:commands" rehash 1

# Load environment variables for development secrets
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
