#!/usr/bin/env bash

# Exit when any command fails
set -e
# Enable debug mode to print out commands a la Ansible prior to running them
set -x

# Make sure the system is up to date
sudo apt update
sudo apt upgrade -y
sudo apt dist-upgrade -y

# Install stow since it's needed for some pre-installation setup
sudo apt install -y stow

# Make needed directories
mkdir -p ~/.config
mkdir -p ~/.bin

# Stow general config files
stow ack
stow git
stow neovim
stow starship
stow tmux

# Install general packages
sudo apt install -y ack fzf git grep imagemagick less neovim python python3 python3-pip shellcheck tldr tmux tree unzip watch xfce4 zsh

# Install Go
wget -O go.tar.gz https://dl.google.com/go/go1.13.7.linux-armv6l.tar.gz
tar -C ~/.bin -xzf go.tar.gz
rm go.tar.gz

# Install Rust
curl https://sh.rustup.rs -sSf | sh -s -- -y
# Install the Starship prompt
cargo install starship

# Install fzf zsh support
# $(brew --prefix)/opt/fzf/install --all

# Install neovim Python module
pip3 install neovim

# Install vim-plug
curl -fLo ~/.local/share/nvim/site/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim

# Install nvim plugins
nvim --headless +PlugUpdate +PlugUpgrade +UpdateRemotePlugins +GoUpdateBinaries +qall

# Install Oh My Zsh
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" --unattended || true

# Remove the default ~/.zshrc
rm ~/.zshrc || true
stow zsh

# Change user shell to Zsh
command -v zsh | sudo tee -a /etc/shells && sudo usermod --shell $(command -v zsh) $(whoami)

# Generate SSH keypairs
cat /dev/zero | ssh-keygen -q -N "" || true
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa

# Install imcat
git clone https://github.com/stolk/imcat.git && cd imcat && make && mv imcat ~/.bin && cd .. && rm -rf imcat

echo "Remember to use raspi-config to enable VNC, set a resolution, change the timezone, and generate locales"
