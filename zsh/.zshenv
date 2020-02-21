test -d /home/linuxbrew/.linuxbrew && eval $(/home/linuxbrew/.linuxbrew/bin/brew shellenv)

# Go setup
export GOPATH="$HOME/.go"
export GOBIN="$GOPATH/bin"
export GOPRIVATE="goms.io"
export GO111MODULE=on

# Path config
PATH="$PATH:$GOPATH/bin"
PATH="$PATH:$HOME/.bin"

# Automatically start tmux at login
export ZSH_TMUX_AUTOSTART=true
export ZSH_TMUX_AUTOQUIT=false

# Set default options for fzf
export FZF_DEFAULT_OPTS="--height 20% --border --bind alt-j:down,alt-k:up"
export FZF_DEFAULT_COMMAND="fd --type f --hidden --follow --exclude .git"

# Apply the Dracula theme to fzf
export FZF_DEFAULT_OPTS=$FZF_DEFAULT_OPTS'
--color=dark
--color=fg:-1,bg:-1,hl:#5fff87,fg+:-1,bg+:-1,hl+:#ffaf5f
--color=info:#af87ff,prompt:#5fff87,pointer:#ff87d7,marker:#ff87d7,spinner:#ff87d7
'
