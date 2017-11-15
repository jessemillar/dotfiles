" Plugins managed by vim-plug (https://github.com/junegunn/vim-plug#installation)

call plug#begin('~/.vim/plugged')

Plug 'valloric/youcompleteme', { 'do': './install.py --tern-completer --gocode-completer' }
Plug 'fatih/vim-go'
Plug 'scrooloose/nerdtree'
Plug 'tpope/vim-surround'
Plug 'chiel92/vim-autoformat'
Plug 'tpope/vim-sensible'
Plug 'mhinz/vim-startify'
Plug 'pangloss/vim-javascript'
Plug 'tpope/vim-repeat'
Plug 'othree/eregex.vim'
Plug 'leafgarland/typescript-vim'
Plug 'roxma/vim-paste-easy'
Plug 'justinj/vim-pico8-syntax'
Plug 'dracula/vim'
Plug 'reedes/vim-pencil'

call plug#end()

" Fix a Vim rendering bug (https://github.com/zeit/hyper/issues/1037#issuecomment-269848444)
set t_RV=

" Make scrolling faster when viewing large files in split mode
set lazyredraw

" Enable easier pasting
autocmd VimEnter * PasteEasyEnable

" Deal with Arduino files properly
autocmd BufNewFile,BufReadPost *.ino,*.pde set filetype=cpp

" Non-arrow arrows for NERDTree because I use a custom font
let g:NERDTreeDirArrowExpandable="+"
let g:NERDTreeDirArrowCollapsible="~"

" Show hidden files in NERDTree
let NERDTreeShowHidden=1

" Autocompletion for strings, comments, and text files
let g:ycm_filetype_blacklist = {}
let g:ycm_collect_identifiers_from_comments_and_strings = 1

" Enable JavaScript syntax highlighting
let g:javascript_plugin_jsdoc = 1

" Change location of saved swap files
set directory=/tmp

" Better movement between panes
nnoremap <C-J> <C-W><C-J>
nnoremap <C-K> <C-W><C-K>
nnoremap <C-L> <C-W><C-L>
nnoremap <C-H> <C-W><C-H>

" More readable YouCompleteMe popup with my current theme
highlight Pmenu ctermfg=0 ctermbg=243
highlight PmenuSel ctermfg=0 ctermbg=255

" Custom tab widths
set tabstop=4
set shiftwidth=4

" Syntastic settings
let g:syntastic_always_populate_loc_list = 1
let g:syntastic_auto_loc_list = 1
let g:syntastic_check_on_open = 1
let g:syntastic_check_on_wq = 0

" Custom mapping for NERDTree
command! NT NERDTreeToggle

" Custom mapping for Go definition finding
command! GD GoDef

" Custom mapping for Autoformat
command! AF Autoformat

command! SP :set spell!
autocmd BufRead,BufNewFile *.md setlocal spell

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

" Run goimports instead of gofmt
let g:go_fmt_command = "goimports"

" Walmart
let g:startify_custom_header = [
			\"          '###'          ",
			\"          '###'          ",
			\"  .#.      ###      .#.  ",
			\" '####,    ###    ,####' ",
			\"   '####,  '-'  ,####'   ",
			\"      '##'     '##'      ",
			\"                         ",
			\"      .##.     .##.      ",
			\"   .####'  .-.  '####.   ",
			\" .####'    ###    '####. ",
			\"  '#'      ###      '#'  ",
			\"          .###.          ",
			\"          .###.          ",
			\]
