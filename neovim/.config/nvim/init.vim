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
Plug 'dracula/vim'
Plug 'fatih/vim-go'
Plug 'justinj/vim-pico8-syntax'
Plug 'leafgarland/typescript-vim'
Plug 'othree/eregex.vim'
Plug 'roxma/vim-paste-easy'
Plug 'sbdchd/neoformat'
Plug 'tpope/vim-repeat'
Plug 'tpope/vim-sensible'
Plug 'tpope/vim-surround'
Plug 'zchee/deoplete-go', { 'do': 'make'}
Plug 'zivyangll/git-blame.vim'

call plug#end()

" Load vim-sensible first so we can override defaults
runtime! plugin/sensible.vim

" Disable netrw history
let g:netrw_dirhistmax = 0

" Enable autocompletion with tab support
highlight Pmenu ctermfg=236 ctermbg=243
highlight PmenuSel ctermfg=236 ctermbg=255
let g:deoplete#enable_at_startup = 1
let g:deoplete#enable_smart_case = 1
inoremap <silent><expr> <TAB>
	\ pumvisible() ? "\<C-n>" :
	\ <SID>check_back_space() ? "\<TAB>" :
	\ deoplete#mappings#manual_complete()
function! s:check_back_space() abort "{{{
    let col = col('.') - 1
    return !col || getline('.')[col - 1] =~ '\s'
endfunction"}}}

" Trim trailing whitespace on save
autocmd BufWritePre * :%s/\s\+$//e

" Don't open scratch windows
set completeopt-=preview

" Enable easier pasting
autocmd VimEnter * PasteEasyEnable

" Enable JavaScript syntax highlighting
let g:javascript_plugin_jsdoc = 1

" Change location of saved swap files
set directory=/tmp

" Better movement between panes
nnoremap <C-J> <C-W><C-J>
nnoremap <C-K> <C-W><C-K>
nnoremap <C-L> <C-W><C-L>
nnoremap <C-H> <C-W><C-H>
set splitbelow
set splitright

" Easier pane resizing
nnoremap <silent> <Leader>H :exe "vertical resize -10"<CR>
nnoremap <silent> <Leader>J :exe "resize +5"<CR>
nnoremap <silent> <Leader>K :exe "resize -5"<CR>
nnoremap <silent> <Leader>L :exe "vertical resize +10"<CR>

" Custom tab widths
set tabstop=2
set shiftwidth=2

" Quick spellcheck toggle
command! SP :set spell!

" Automatically enable spellcheck for .md files and don't mark URL-like things as spelling errors
autocmd BufRead,BufNewFile *.md setlocal spell | syn match UrlNoSpell '\w\+:\/\/[^[:space:]]\+' contains=@NoSpell
hi SpellBad ctermfg=236

" Search color
hi Search ctermfg=236

" Show hybrid line numbers by default
set number
set relativenumber

" Go syntax highlighting
let g:go_highlight_functions = 1
let g:go_highlight_methods = 1
let g:go_highlight_fields = 1
let g:go_highlight_types = 1
let g:go_highlight_operators = 1
let g:go_highlight_build_constraints = 1
let g:go_auto_sameids = 1

" Run goimports instead of gofmt
let g:go_fmt_command = 'goimports'

" Tell Deoplete where gocode is to improve performance
let g:deoplete#sources#go#gocode_binary = $GOPATH.'/bin/gocode'

" Jump to next and previous issues in Go code
map <C-n> :cn<CR>
map <C-m> :cp<CR>

" Git blame config
nnoremap <Leader>b :<C-u>call gitblame#echo()<CR>
