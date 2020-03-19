# Path to your oh-my-zsh installation
export ZSH=~/.oh-my-zsh

# Load plugins
plugins=(docker docker-compose fzf tmux vi-mode wd)

# Load up Oh My Zsh
source $ZSH/oh-my-zsh.sh

# Enable autocomplete for hidden files
setopt globdots

# Let Zsh prevent me from being an idiot and typing the wrong things over and over
setopt correct

# Enable the mass-rename zmv tool
autoload -U zmv

# Don't trust the cache of binaries to make installation of new programs slightly easier at the cost of performance
zstyle ":completion:*:commands" rehash 1

# Load environment variables for development secrets
[ -f ~/.envrc ] && source ~/.envrc

# Load Docker environment variables
[ -f ~/.dockerrc ] && source ~/.dockerrc

# Load custom aliases
[ -f ~/.aliasrc ] && source ~/.aliasrc

# Load custom functions
[ -f ~/.functionsrc ] && source ~/.functionsrc

# Enable fzf fuzzy completion
[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh

# Load custom functions for ASCII art
[ -f ~/.asciirc ] && source ~/.asciirc

# Load various CLI helpers
# TODO Fix h autocompletion
# source <(h version &>/dev/null && h completion zsh | sed "s/helm/h/g")
source <(k version &>/dev/null && k completion zsh | sed "s/kubectl/k/g")

# Load GVM so I can use older versions of Go
[[ -s "$HOME/.gvm/scripts/gvm" ]] && source "$HOME/.gvm/scripts/gvm"

# Print a random logo
printAscii

# Start Starship
eval "$(starship init zsh)"
