test -d /home/linuxbrew/.linuxbrew && eval $(/home/linuxbrew/.linuxbrew/bin/brew shellenv)

# Go setup
export GOPATH="$HOME/.go"
export GOPRIVATE="goms.io"

# Path config
PATH="$PATH:$GOPATH/bin"
PATH="$PATH:$HOME/.bin"

