" curl -fLo ~/.vim/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim

call plug#begin('~/.vim/plugged')

Plug 'valloric/youcompleteme', { 'do': './install.py --tern-completer --gocode-completer' }
Plug 'fatih/vim-go'
Plug 'scrooloose/nerdtree'
Plug 'scrooloose/syntastic'
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

call plug#end()

" Enable easier pasting
autocmd VimEnter * PasteEasyEnable

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

" Keep the cursor in the center of the screen
set scrolloff=999

" WALMART
let g:startify_custom_header = [
			\"          '###'          ",
			\"          '###'          ",
			\"  .#.      ###      .#.  ",
			\" '####'    ###    '####' ",
			\"   '####'  '-'  '####'   ",
			\"      '##'     '##'      ",
			\"                         ",
			\"      .##.     .##.      ",
			\"   .####.  .-.  .####.   ",
			\" .####.    ###    .####. ",
			\"  '#'      ###      '#'  ",
			\"          .###.          ",
			\"          .###.          ",
			\]
