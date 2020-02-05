# exit when any command fails
set -e
set -x

sudo apt update
sudo apt upgrade -y
sudo apt install -y stow
mkdir -p ~/.config
mkdir -p ~/.bin
stow ack
stow git
stow neovim
stow starship
stow tmux
sudo apt install -y ack fzf git golang grep imagemagick less neovim python python3 python3-pip shellcheck tldr tmux tree unzip watch xfce4 zsh

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
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
# Remove the default ~/.zshrc
rm ~/.zshrc
stow zsh
# Change user shell to Zsh
command -v zsh | sudo tee -a /etc/shells && sudo usermod --shell $(command -v zsh) $(whoami)
# TODO Generate SSH keypairs
cat /dev/zero | ssh-keygen -q -N ""
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
# Install imcat
git clone https://github.com/stolk/imcat.git && cd imcat && make && mv imcat ~/.bin && cd .. && rm -rf imcat

echo "Enable VNC in the raspi-config menu and set a resolution"
