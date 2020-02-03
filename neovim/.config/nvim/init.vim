" Plugins managed by vim-plug (https://github.com/junegunn/vim-plug#installation)
if empty(glob('~/.local/share/nvim/site/autoload/plug.vim'))
	silent !curl -fLo ~/.local/share/nvim/site/autoload/plug.vim --create-dirs
		\ https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
	autocmd VimEnter * PlugInstall --sync | source $MYVIMRC
endif

call plug#begin('~/.local/share/nvim/plugged')

Plug 'Shougo/deoplete.nvim', { 'do': ':UpdateRemotePlugins' }
Plug 'brooth/far.vim'
Plug 'christoomey/vim-tmux-navigator'
Plug 'deoplete-plugins/deoplete-go', { 'do': 'make'}
Plug 'dracula/vim'
Plug 'dyng/ctrlsf.vim'
Plug 'edkolev/tmuxline.vim', { 'do': ':TmuxlineSnapshot! ~/.dotfiles/tmux/tmuxline.conf' }
Plug 'fatih/vim-go'
Plug 'junegunn/fzf', { 'dir': '~/.fzf', 'do': './install --bin' }
Plug 'junegunn/fzf.vim'
Plug 'leafgarland/typescript-vim'
Plug 'machakann/vim-sandwich'
Plug 'othree/eregex.vim'
Plug 'preservim/nerdcommenter'
Plug 'roxma/vim-paste-easy'
Plug 'roxma/vim-tmux-clipboard'
Plug 'sbdchd/neoformat'
Plug 'tpope/vim-fugitive'
Plug 'tpope/vim-repeat'
Plug 'tpope/vim-sensible'
Plug 'vim-airline/vim-airline'
Plug 'zivyangll/git-blame.vim'

call plug#end()

" Load vim-sensible first so we can override defaults
runtime! plugin/sensible.vim

" Disable netrw history
let g:netrw_dirhistmax = 0

" Trim trailing whitespace on save
autocmd BufWritePre * :%s/\s\+$//e

" Don't open scratch windows
set completeopt-=preview

" Add spaces after comment delimiters by default
let g:NERDSpaceDelims = 1

" Use deoplete with tab
let g:deoplete#enable_at_startup = 1
highlight Pmenu ctermfg=236 ctermbg=243
highlight PmenuSel ctermfg=236 ctermbg=255
inoremap <expr><TAB> pumvisible() ? "\<C-n>" : "\<TAB>"

" Use the Dracula theme for vim-airline
let g:airline_theme='dracula'
let g:airline_powerline_fonts=1

" Don't run too many calculations on the git repo
let g:airline#extensions#branch#vcs_checks = []

" Customize the tmuxline display
let g:tmuxline_preset = {
      \'a'    : '#S',
      \'b'    : '#W',
      \'x'    : '%a, %b %e',
      \'y'    : '%l:%M %P',
      \'z'    : '#H'}

" Enable easier pasting
autocmd VimEnter * PasteEasyEnable

" Map fzf to Control + P
:nnoremap <C-P> :FZF<CR>

" Customize fzf colors to match my color scheme
" - fzf#wrap translates this to a set of `--color` options
let g:fzf_colors =
\ { 'fg':      ['fg', 'Normal'],
  \ 'bg':      ['bg', 'Normal'],
  \ 'hl':      ['fg', 'Comment'],
  \ 'fg+':     ['fg', 'CursorLine', 'CursorColumn', 'Normal'],
  \ 'bg+':     ['bg', 'CursorLine', 'CursorColumn'],
  \ 'hl+':     ['fg', 'Statement'],
  \ 'info':    ['fg', 'PreProc'],
  \ 'border':  ['fg', 'Ignore'],
  \ 'prompt':  ['fg', 'Conditional'],
  \ 'pointer': ['fg', 'Exception'],
  \ 'marker':  ['fg', 'Keyword'],
  \ 'spinner': ['fg', 'Label'],
  \ 'header':  ['fg', 'Comment'] }

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
command! NF :Neoformat

" Automatically enable spellcheck for .md files and don't mark URL-like things as spelling errors
autocmd BufRead,BufNewFile *.md setlocal spell | syn match UrlNoSpell '\w\+:\/\/[^[:space:]]\+' contains=@NoSpell
hi SpellBad ctermfg=236

" Search color
hi Search ctermfg=236

" Show line numbers by default
set number

" Go syntax highlighting
let g:go_highlight_functions = 1
let g:go_highlight_methods = 1
let g:go_highlight_fields = 1
let g:go_highlight_types = 1
let g:go_highlight_operators = 1
let g:go_highlight_build_constraints = 1
let g:go_auto_sameids = 1

" Go quick commands
command! GD :GoDef
command! GB :GoBuild
command! GR :w|:GoRename
command! GT :GoTest
command! GTF :GoTestFunc

" Keyboard shortcuts for use with the vim-go quickfix window (appears after
" :GoBuild)
map <C-n> :cnext<CR>
map <C-m> :cprevious<CR>
nnoremap <leader>a :cclose<CR>

" Run goimports instead of gofmt
let g:go_fmt_command = 'goimports'

" Use gopls for renaming since modules are what I usually work with
let g:go_rename_command = 'gopls'

" Tell Deoplete where gocode is to improve performance
let g:deoplete#sources#go#gocode_binary = $GOPATH.'/bin/gocode'

" Tell Deoplete to autocomplete all Go-related things
call deoplete#custom#option('omni_patterns', { 'go': '[^. *\t]\.\w*' })

" Make CtrlSF use regular expressions by default
let g:ctrlsf_regex_pattern = 1

" Tell CtrlSF to use ack as the search program
let g:ctrlsf_ackprg = 'ack'

" Git blame config
nnoremap <Leader>b :<C-u>call gitblame#echo()<CR>
