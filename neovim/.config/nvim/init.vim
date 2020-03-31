" Plugins managed by vim-plug (https://github.com/junegunn/vim-plug#installation)
if empty(glob('~/.local/share/nvim/site/autoload/plug.vim'))
	silent !curl -fLo ~/.local/share/nvim/site/autoload/plug.vim --create-dirs
		\ https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
	autocmd VimEnter * PlugInstall --sync | source $MYVIMRC
endif

call plug#begin('~/.local/share/nvim/plugged')

Plug 'arcticicestudio/nord-vim'
Plug 'autozimu/LanguageClient-neovim', { 'branch': 'next', 'do': 'bash install.sh', }
Plug 'benmills/vimux'
Plug 'brooth/far.vim'
Plug 'christoomey/vim-tmux-navigator'
Plug 'dense-analysis/ale'
Plug 'dyng/ctrlsf.vim'
Plug 'edkolev/tmuxline.vim', { 'do': ':TmuxlineSnapshot! ~/.dotfiles/tmux/tmuxline.conf' }
Plug 'fatih/vim-go'
Plug 'junegunn/fzf', { 'dir': '~/.fzf', 'do': './install --bin' }
Plug 'junegunn/fzf.vim'
Plug 'machakann/vim-sandwich'
Plug 'othree/eregex.vim'
Plug 'preservim/nerdcommenter'
Plug 'roxma/vim-paste-easy'
Plug 'roxma/vim-tmux-clipboard'
Plug 'sbdchd/neoformat'
Plug 'sebdah/vim-delve'
Plug 'Shougo/deoplete.nvim', { 'do': ':UpdateRemotePlugins' }
Plug 'tpope/vim-fugitive'
Plug 'tpope/vim-repeat'
Plug 'vim-airline/vim-airline'
Plug 'zivyangll/git-blame.vim'

call plug#end()

" Use the Nord color scheme
colorscheme nord
if (has("termguicolors"))
  set termguicolors
endif

" Tell far to use ack
let g:far#source = 'acknvim'

" Disable netrw history
let g:netrw_dirhistmax = 0

" Don't color in the gutter
highlight clear SignColumn

" Use Escape to exit insert mode in the terminal
:tnoremap <Esc> <C-\><C-n>

" Trim trailing whitespace on save
autocmd BufWritePre * :%s/\s\+$//e

" Reload this config file easily
command! Reload :source $MYVIMRC

" Preview replaces live
set inccommand=nosplit

" Don't open scratch windows
set completeopt-=preview

" Add spaces after comment delimiters by default
let g:NERDSpaceDelims = 1

" Quickly toggle Go breakpoints
nnoremap <Leader>b :DlvToggleBreakpoint<CR>

" Use deoplete with tab
let g:deoplete#enable_at_startup = 1
highlight Pmenu ctermfg=236 ctermbg=243
highlight PmenuSel ctermfg=236 ctermbg=255
inoremap <silent><expr><tab> pumvisible() ? "\<C-n>" : "\<TAB>"
inoremap <silent><expr><s-tab> pumvisible() ? "\<C-p>" : "\<S-TAB>"

" Enable a shortcut for inserting bash shebangs
command! Shebang :normal! i#!/usr/bin/env bash<CR><Esc>

" Make a shortcut for killing smart quotes
command! SmartQuotes :%s/’/'/ge | :%s/[“”]/"/ge

" Use an Omni pattern for Go completions
call deoplete#custom#option('omni_patterns', {
	\ 'go': '[^. *\t]\.\w*',
	\})

" Configure vim-airline
let g:airline_theme='nord'
let g:airline_powerline_fonts=1
let g:airline#extensions#tabline#enabled = 1
let g:airline#extensions#tabline#formatter = 'unique_tail_improved'
let g:airline_left_sep = ''
let g:airline_left_alt_sep = '|'
let g:airline_right_sep = ''
let g:airline_right_alt_sep = '|'

" Don't run too many calculations on the git repo
let g:airline#extensions#branch#vcs_checks = []

" Customize the tmuxline display
let g:tmuxline_powerline_separators = 0
let g:tmuxline_preset = {
      \'a'    : '#S',
      \'b'    : '#H',
      \'win'  : '#I#F #W',
      \'cwin' : '#I#F #W',
      \'y'    : '%a, %b %e',
      \'z'    : '%l:%M %P'}

" Tab between buffers
nnoremap  <silent>   <tab>  :if &modifiable && !&readonly && &modified <CR> :write<CR> :endif<CR>:bnext<CR>
nnoremap  <silent> <s-tab>  :if &modifiable && !&readonly && &modified <CR> :write<CR> :endif<CR>:bprevious<CR>

" Enable easier pasting
autocmd VimEnter * PasteEasyEnable

" Map fzf to Control + P
nnoremap <C-P> :FZF<CR>

" Change location of saved swap files
set directory=/tmp

" Better movement between panes
nnoremap <C-J> <C-W><C-J>
nnoremap <C-K> <C-W><C-K>
nnoremap <C-L> <C-W><C-L>
nnoremap <C-H> <C-W><C-H>
set splitbelow
set splitright

" Custom tab widths
set tabstop=2
set shiftwidth=2

" Quick code format
command! Format :Neoformat

" Automatically enable spellcheck for .md files and don't mark URL-like things as spelling errors
autocmd BufRead,BufNewFile *.md setlocal spell | syn match UrlNoSpell '\w\+:\/\/[^[:space:]]\+' contains=@NoSpell
hi SpellBad ctermfg=236

" Show line numbers by default
set number

" Hide linux numbers in the terminal
au TermOpen * setlocal nonumber norelativenumber

" Use vimux for Go debugging
let g:delve_use_vimux  = 1
let g:VimuxHeight = "25"
command! Delve :DlvDebug

" Allow for number toggling (for copying)
command! LineNumbers set number!

" Go syntax highlighting
let g:go_highlight_functions = 1
let g:go_highlight_methods = 1
let g:go_highlight_fields = 1
let g:go_highlight_types = 1
let g:go_highlight_operators = 1
let g:go_highlight_build_constraints = 1

" Use gopls for various things
let g:go_def_mode = 'gopls'

" Tell vim to automatically save file changes before running certain commands
set autowrite

" Keyboard shortcuts for use with the vim-go quickfix window (appears after :GoBuild)
map <C-n> :cnext<CR>
map <C-m> :cprevious<CR>
nnoremap <leader>a :cclose<CR>

" Run goimports instead of gofmt
let g:go_fmt_command = 'goimports'

" Configure CtrlSF
let g:ctrlsf_regex_pattern = 1
let g:ctrlsf_default_root = 'project'
let g:ctrlsf_ackprg = 'ack'
nmap     <C-F>f <Plug>CtrlSFPrompt
vmap     <C-F>f <Plug>CtrlSFVwordPath
vmap     <C-F>F <Plug>CtrlSFVwordExec
nmap     <C-F>n <Plug>CtrlSFCwordPath
nmap     <C-F>p <Plug>CtrlSFPwordPath
nnoremap <C-F>o :CtrlSFOpen<CR>
nnoremap <C-F>t :CtrlSFToggle<CR>
inoremap <C-F>t <Esc>:CtrlSFToggle<CR>

" Git blame config
command! Blame :call gitblame#echo()

" Configure LanguageClient
" Required for operations modifying multiple buffers like rename
set hidden
let g:LanguageClient_serverCommands = {
		\ 'go': ['gopls'],
		\ 'yaml': ['yaml-language-server', '--stdio'],
    \ 'sh': ['bash-language-server', 'start'],
    \ }

nnoremap <F5> :call LanguageClient_contextMenu()<CR>
nnoremap <silent> K :call LanguageClient#textDocument_hover()<CR>
nnoremap <silent> gd :call LanguageClient#textDocument_definition()<CR>
nnoremap <silent> gi :call LanguageClient#textDocument_implementation()<CR>
nnoremap <silent> <F2> :call LanguageClient#textDocument_rename()<CR>
