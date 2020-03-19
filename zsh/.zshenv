test -d /home/linuxbrew/.linuxbrew && eval $(/home/linuxbrew/.linuxbrew/bin/brew shellenv)

# Go setup
export GOPATH="$HOME/.go"
export GOBIN="$GOPATH/bin"
export GOPRIVATE="goms.io"
export GO111MODULE=on
export DELVE_EDITOR="$(which nvim)"

# Kubernetes setup
export KUBERNETES_VERSION=1.17.2

# Kubebuilder asset setup
export KUBEBUILDER_ASSETS="$HOME/.bin/"

# Path config
PATH="$PATH:$GOPATH/bin"
PATH="$PATH:$HOME/.bin"

# Automatically start tmux at login
export ZSH_TMUX_AUTOSTART=true
export ZSH_TMUX_AUTOQUIT=false

# Set default options for fzf
export FZF_DEFAULT_OPTS="--height 20% --border --bind alt-j:down,alt-k:up"
export FZF_DEFAULT_COMMAND="fd --type f --hidden --follow --exclude .git"

# Apply the Nord theme to fzf
export FZF_DEFAULT_OPTS=$FZF_DEFAULT_OPTS'
--color fg:#D8DEE9,bg:#2E3440,hl:#A3BE8C,fg+:#D8DEE9,bg+:#434C5E,hl+:#A3BE8C
--color pointer:#BF616A,info:#4C566A,spinner:#4C566A,header:#4C566A,prompt:#81A1C1,marker:#EBCB8B
'
