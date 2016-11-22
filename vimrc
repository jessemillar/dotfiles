" curl -fLo ~/.vim/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim

call plug#begin('~/.vim/plugged')

Plug 'bling/vim-airline'
Plug 'vim-airline/vim-airline-themes'
Plug 'ervandew/supertab'
Plug 'scrooloose/nerdtree'
Plug 'scrooloose/syntastic'
Plug 'tpope/vim-surround'
Plug 'fatih/vim-go'
Plug 'chiel92/vim-autoformat'
Plug 'tpope/vim-sensible'
Plug 'mhinz/vim-startify'
Plug 'pangloss/vim-javascript'
Plug 'tpope/vim-repeat'
Plug 'othree/eregex.vim'

call plug#end()

" Disable arrow keys
noremap <Up> <Nop>
noremap <Down> <Nop>
noremap <Left> <Nop>
noremap <Right> <Nop>

" Enable JavaScript syntax highlighting
let g:javascript_plugin_jsdoc = 1

" Change location of saved swap files
set directory=/tmp

" Better movement between panes
nnoremap <C-J> <C-W><C-J>
nnoremap <C-K> <C-W><C-K>
nnoremap <C-L> <C-W><C-L>
nnoremap <C-H> <C-W><C-H>

" Make spellcheck easier
map <F11> :setlocal spell! spelllang=en_us<CR>

" Custom tab widths
set tabstop=4
set shiftwidth=4

" Always show Airline
set laststatus=2
let g:airline_theme='papercolor'

" Syntastic settings
set statusline+=%#warningmsg#
set statusline+=%{SyntasticStatuslineFlag()}
set statusline+=%*
let g:syntastic_always_populate_loc_list = 1
let g:syntastic_auto_loc_list = 1
let g:syntastic_check_on_open = 1
let g:syntastic_check_on_wq = 0

" Smaller command for pastetoggle
set pastetoggle=<F12>

" Custom mapping for NERDTree
command! NT NERDTreeToggle

" Custom mapping for Autoformat
command! AF Autoformat

" Show hybrid line numbers by default 
set number
set relativenumber

" Change the color of line numbers
highlight LineNr ctermfg=DarkGrey

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

" Make autocomplete honor dash separators
set iskeyword+=-

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
