#!/usr/bin/env bash

# Exit when any command fails
set -e

# Source .functionsrc to get access to the ruler function
# shellcheck disable=SC1091
source zsh/.functionsrc

ruler "Make sure the system is up to date"
sudo apt update
sudo apt upgrade -y
sudo apt dist-upgrade -y

ruler "Install stow since it's needed for some pre-installation setup"
sudo apt install -y stow

ruler "Make .config and .bin directories"
mkdir -p ~/.config || true
mkdir -p ~/.bin || true

ruler "Stow general config files"
stow ack
stow git
stow neovim
stow starship
stow tmux

ruler "Install general packages"
sudo apt install -y ack git grep imagemagick less neovim python python3 python3-pip shellcheck tldr tmux tree unzip watch xfce4 zsh

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
