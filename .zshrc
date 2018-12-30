# Path to your oh-my-zsh installation
export ZSH=~/.oh-my-zsh
source <(antibody init)

# Set the prompt theme
ZSH_THEME="mister-michael"

# Makes repository status check for large repositories much, much faster
DISABLE_UNTRACKED_FILES_DIRTY="true"

# Make NVM load in a way that doesn't slow down terminal startup
NVM_LAZY_LOAD=true

# User configuration
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/sbin:/usr/bin/core_perl"

# Put Go in my path
export GOPATH=~/.go
export PATH=$PATH:$GOPATH/bin

# Enable the itch.io butler
export PATH=$PATH:~/Library/Application\ Support/itch/apps/butler

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

# Load plugins
plugins=(wd vi-mode)
antibody bundle lukechilds/zsh-nvm

source $ZSH/oh-my-zsh.sh

# Print a logo
if [ $(($RANDOM % 2)) -eq 1 ]
then
	# Print an Overwatch Sombra logo
	sombra
else
	# Print a Walmart Labs logo
	labs
fi

# Add RVM to PATH for scripting. Make sure this is the last PATH variable change.
export PATH="$PATH:$HOME/.rvm/bin"
