# https://github.com/sindresorhus/pure
# https://hyper.is/

# Path to your oh-my-zsh installation.
export ZSH=/home/jessemillar/.oh-my-zsh

# Set name of the theme to load.
# Look in ~/.oh-my-zsh/themes/
# Optionally, if you set this to "random", it'll load a random theme each
# time that oh-my-zsh is loaded.
ZSH_THEME=""

# Uncomment the following line if you want to disable marking untracked files
# under VCS as dirty. This makes repository status check for large repositories
# much, much faster.
DISABLE_UNTRACKED_FILES_DIRTY="true"

# Which plugins would you like to load?
# Example format: plugins=(rails git textmate ruby lighthouse)
plugins=(wd)

# User configuration
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/sbin"

export GOPATH=/home/jessemillar/.go
export PATH=$PATH:$GOPATH/bin

source $ZSH/oh-my-zsh.sh

# Load environment variables
[ -f .envrc ] && source .envrc

# Load Docker environment variables
[ -f .dockerrc ] && source .dockerrc

# Load custom aliases
[ -f .aliasrc ] && source .aliasrc

autoload -U promptinit; promptinit

# Load prompt configuration
[ -f .purerc ] && source .purerc
