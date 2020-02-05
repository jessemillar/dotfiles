sudo apt install stow
mkdir -p ~/.config
mkdir -p ~/.bin
stow ack
stow git
stow neovim
stow starship
stow tmux
sudo apt install ack bat fzf git go grep imagemagick less neovim python python3 shellcheck starship tldr tmux tokei tree unzip watch zsh

    - name: Install fzf zsh support
      shell: $(brew --prefix)/opt/fzf/install --all
      changed_when: false
    - name: Install "prettier" Node.js package globally
      npm:
        name: prettier
        global: yes
    - name: Install neovim Python module
      shell: pip3 install neovim
      register: result
      changed_when: "result.stdout is not search('Requirement already satisfied: neovim')"
    - name: Install nvim plugins
      command: nvim --headless +GoUpdateBinaries +PlugUpdate +PlugUpgrade +UpdateRemotePlugins +qall
      changed_when: false
    - name: Install vim-plug
      command: curl -fLo ~/.local/share/nvim/site/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
      changed_when: false
   # Install Oh My Zsh
      shell: sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
      register: result
      changed_when: result.stdout is not search("You already have Oh My Zsh installed.")
      failed_when: result.rc != 0 and result.stdout is not search("You already have Oh My Zsh installed.")
   # Remove the default ~/.zshrc
        rm ~/.zshrc
      stow zsh
# Change user shell to Zsh
command -v zsh | sudo tee -a /etc/shells && sudo usermod --shell $(command -v zsh) $(whoami)
    - openssh_keypair:
        path: ~/.ssh/id_rsa
# Install imcat
git clone https://github.com/stolk/imcat.git && cd imcat && make && mv imcat ~/.bin && cd .. && rm -rf imcat
