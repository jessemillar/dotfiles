#!/usr/bin/env bash

# Exit when any command fails
set -e

function moveIfSymlink() {
	if [[ ! -L "$1" && -d "$1" ]]
	then
		mv "$1" "$1".bak
	fi
}

# Wrap all commands in a subshell
(
cd ..

# Source .functionsrc to get access to the ruler function
# shellcheck disable=SC1091
source zsh/.functionsrc

if ! [ -x "$(command -v mosh)" ]
then
	ruler "Installing mosh"
	sudo apt update
	sudo apt install -y mosh
	ruler "Exit the session, reattach with mosh, and run bootstrap-pi.sh again"
	return
fi

ruler "Make sure the system is up to date"
sudo apt update
sudo apt upgrade -y
sudo apt dist-upgrade -y

ruler "Apply window manager configs"
moveIfSymlink "$HOME/.config/lxpanel"
moveIfSymlink "$HOME/.config/lxsession"
moveIfSymlink "$HOME/.config/lxterminal"
stow pixel

ruler "Install stow since it's needed for some pre-installation setup"
sudo apt install -y stow

ruler "Make .config, .bin, and Projects  directories"
mkdir -p ~/.config || true
mkdir -p ~/.bin || true
mkdir -p ~/Projects || true

ruler "Stow general config files"
stow ack
stow git
stow neovim
stow starship
stow tmux

ruler "Install general packages"
sudo apt install -y ack fonts-firacode git grep imagemagick less neovim python python3 python3-pip shellcheck tldr tmux tree unzip watch xfce4 zsh

ruler "Install Lua packages"
sudo apt install luarocks
sudo luarocks install lanes
sudo luarocks install luacheck

ruler "Install Go"
GO_VERSION="go1.13.8"
if ! grep -q "$GO_VERSION" ~/.gox/VERSION; then
	# Delete the existing, outdated Go version
	rm -rf ~/.gox || true
	# Clean up any broken symlinks
	find ~/.bin -xtype l -delete
fi
if [ ! -d ~/.gox ]; then
	wget -O go.tar.gz https://dl.google.com/go/$GO_VERSION.linux-armv6l.tar.gz
	tar -C ~/ -xzf go.tar.gz
	mv ~/go ~/.gox
	ln -s ~/.gox/bin/* ~/.bin
	rm go.tar.gz
fi

ruler "Install Rust"
curl https://sh.rustup.rs -sSf | sh -s -- -y

ruler "Install the Starship prompt"
cargo install starship

ruler "Install neovim Python module"
pip3 install msgpack neovim -U

ruler "Install vim-plug"
curl -fLo ~/.local/share/nvim/site/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim

ruler "Install nvim plugins"
nvim --headless +PlugUpdate +PlugUpgrade +UpdateRemotePlugins +GoUpdateBinaries +qall

ruler "Install Oh My Zsh"
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" --unattended || true

ruler "Replace the default ~/.zshrc"
rm ~/.zshrc || true
stow zsh

ruler "Change user shell to Zsh"
command -v zsh | sudo tee -a /etc/shells && sudo usermod --shell "$(command -v zsh)" "$(whoami)"

ruler "Install fzf with Zsh support"
git -C ~/.fzf pull origin master || git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf
~/.fzf/install --all
sudo apt install fd-find

ruler "Generate SSH keypairs"
if [ ! -f  ~/.ssh/id_rsa.pub ]
then
	ssh-keygen -q -N ""
fi
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa

ruler "Install imcat"
git clone https://github.com/stolk/imcat.git && cd imcat && make && mv imcat ~/.bin && cd .. && rm -rf imcat

ruler "Done"
ruler "Remember to use raspi-config to enable VNC, set a resolution, change the timezone, and generate locales"
ruler "Also set UseDNS to 'no' in /etc/ssh/sshd_config"
ruler "Also upload ~/.ssh/id_rsa.pub to GitHub and re-clone .dotfiles"
)
