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

if ! [ -x "$(command -v mosh)" ]
then
	reverb "Install/compile mosh before continuing"
	reverb "Exit the session, reattach with mosh, and run bootstrap-pi.sh again"
	return
fi

reverb "Make sure the system is up to date"
sudo apt update
sudo apt upgrade -y
sudo apt dist-upgrade -y

reverb "Install stow since it's needed for some pre-installation setup"
sudo apt install -y stow

reverb "Apply window manager configs"
moveIfSymlink "$HOME/.config/lxpanel"
moveIfSymlink "$HOME/.config/lxsession"
moveIfSymlink "$HOME/.config/lxterminal"
stow pixel

reverb "Make .config, .bin, and Projects directories"
mkdir -p ~/.config || true
mkdir -p ~/.bin || true
mkdir -p ~/Projects || true

reverb "Stow general config files"
stow ack
stow git
stow neovim
stow starship
stow tmux

reverb "Install general packages"
sudo apt install -y ack fonts-firacode fonts-noto git grep imagemagick less python python3 python3-pip ripgrep shellcheck snapd tldr tmux tree unzip watch xfce4 zsh

reverb "Install Lua packages"
sudo apt install -y luarocks
sudo luarocks install lanes
sudo luarocks install luacheck

reverb "Install Go"
go_version="go1.13.8"
if ! grep -q "$go_version" ~/.gox/VERSION; then
	# Delete the existing, outdated Go version
	rm -rf ~/.gox || true
	# Clean up any broken symlinks
	find ~/.bin -xtype l -delete
fi
if [ ! -d ~/.gox ]; then
	wget -O go.tar.gz https://dl.google.com/go/$go_version.linux-armv6l.tar.gz
	tar -C ~/ -xzf go.tar.gz
	mv ~/go ~/.gox
	ln -s ~/.gox/bin/* ~/.bin
	rm go.tar.gz
fi

reverb "Install Node.js"
curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
sudo apt-get install -y nodejs

reverb "Install lua-fmt"
sudo npm install -g lua-fmt

reverb "Install Rust"
curl https://sh.rustup.rs -sSf | sh -s -- -y
# shellcheck disable=SC1090
source "$HOME"/.cargo/env

reverb "Install the Starship prompt"
sudo apt install -y libssl-dev
cargo install starship

reverb "Install neovim Python module"
pip3 install msgpack neovim -U

reverb "Install vim-plug"
curl -fLo ~/.local/share/nvim/site/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim

reverb "Install nvim plugins"
nvim --headless +PlugUpdate +PlugUpgrade +UpdateRemotePlugins +GoUpdateBinaries +qall

reverb "Install Oh My Zsh"
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" --unattended || true

reverb "Replace the default ~/.zshrc"
rm ~/.zshrc || true
stow zsh

reverb "Change user shell to Zsh"
command -v zsh | sudo tee -a /etc/shells && sudo usermod --shell "$(command -v zsh)" "$(whoami)"

reverb "Install fzf with Zsh support"
git -C ~/.fzf pull origin master || git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf
~/.fzf/install --all
sudo apt install fd-find
ln -s /usr/bin/fdfind ~/.bin/fd || true

reverb "Generate SSH keypairs"
if [ ! -f ~/.ssh/id_rsa.pub ]
then
	ssh-keygen -q -N ""
fi
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa

reverb "Install imcat"
git clone https://github.com/stolk/imcat.git && cd imcat && make && mv imcat ~/.bin && cd .. && rm -rf imcat

reverb "Install fzf-tab-completion"
rm -rf ~/.fzf-tab-completion || true && git clone https://github.com/lincheney/fzf-tab-completion && mv fzf-tab-completion ~/.fzf-tab-completion

reverb "Set up Trello cleaning cron job"
(crontab -l 2>/dev/null; echo "15 8 * * * curl -X PUT $BUTLER_LEWIS_URI >/dev/null 2>&1") | sort - | uniq - | crontab -

reverb "Set up Man Hours Badge keep alive cron job"
(crontab -l 2>/dev/null; echo "0,30 7-22 * * * curl -X GET https://mh.jessemillar.com/ping >/dev/null 2>&1") | sort - | uniq - | crontab -

reverb "Done; Reboot manually"
reverb "Remember to use raspi-config to enable VNC, set a resolution, change the timezone, and generate locales"
reverb "Also set UseDNS to 'no' in /etc/ssh/sshd_config"
reverb "Also upload ~/.ssh/id_rsa.pub to GitHub and re-clone .dotfiles"
)
