" Plugins managed by vim-plug (https://github.com/junegunn/vim-plug#installation)
call plug#begin('~/.local/share/nvim/plugged')

Plug 'Shougo/deoplete.nvim', { 'do': ':UpdateRemotePlugins' }
Plug 'zchee/deoplete-go', { 'do': 'make'}
Plug 'fatih/vim-go'
Plug 'scrooloose/nerdtree'
Plug 'tpope/vim-surround'
Plug 'chiel92/vim-autoformat'
Plug 'tpope/vim-sensible'
Plug 'tpope/vim-repeat'
Plug 'othree/eregex.vim'
Plug 'roxma/vim-paste-easy'
Plug 'justinj/vim-pico8-syntax'
Plug 'dracula/vim'
Plug 'brooth/far.vim'

call plug#end()

" Load vim-sensible first so we can override defaults
runtime! plugin/sensible.vim

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

" Don't open scratch windows
set completeopt-=preview

" Enable easier pasting
autocmd VimEnter * PasteEasyEnable

" Custom mapping for NERDTree
command! NT NERDTreeToggle

" Non-arrow arrows for NERDTree because I use a custom font
let g:NERDTreeDirArrowExpandable='+'
let g:NERDTreeDirArrowCollapsible='~'

" Show hidden files in NERDTree
let NERDTreeShowHidden=1

" Enable JavaScript syntax highlighting
let g:javascript_plugin_jsdoc = 1

" Change location of saved swap files
set directory=/tmp

" Better movement between panes
nnoremap <C-J> <C-W><C-J>
nnoremap <C-K> <C-W><C-K>
nnoremap <C-L> <C-W><C-L>
nnoremap <C-H> <C-W><C-H>

" Custom tab widths
set tabstop=2
set shiftwidth=2

" Custom mapping for Autoformat
command! AF Autoformat

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

" Custom mapping for Go definition finding
command! GD GoDef

" Custom mapping for Go definition finding
command! GR GoRun

" Go syntax highlighting
let g:go_highlight_functions = 1
let g:go_highlight_methods = 1
let g:go_highlight_fields = 1
let g:go_highlight_types = 1
let g:go_highlight_operators = 1
let g:go_highlight_build_constraints = 1

" Run goimports instead of gofmt
let g:go_fmt_command = 'goimports'
