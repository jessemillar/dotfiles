" Plugins managed by vim-plug (https://github.com/junegunn/vim-plug#installation)
if empty(glob('~/.local/share/nvim/site/autoload/plug.vim'))
	silent !curl -fLo ~/.local/share/nvim/site/autoload/plug.vim --create-dirs
		\ https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
	autocmd VimEnter * PlugInstall --sync | source $MYVIMRC
endif

call plug#begin('~/.local/share/nvim/plugged')

Plug 'arcticicestudio/nord-vim'
Plug 'autozimu/LanguageClient-neovim', { 'branch': 'next', 'do': 'bash install.sh', }
Plug 'brooth/far.vim'
Plug 'chrisbra/Colorizer'
Plug 'christoomey/vim-tmux-navigator'
Plug 'dense-analysis/ale'
Plug 'edkolev/tmuxline.vim', { 'do': ':TmuxlineSnapshot! ~/.dotfiles/tmux/tmuxline.conf' }
Plug 'fatih/vim-go'
Plug 'junegunn/fzf', { 'dir': '~/.fzf', 'do': './install --bin' }
Plug 'junegunn/fzf.vim'
Plug 'machakann/vim-sandwich'
Plug 'mzlogin/vim-markdown-toc'
Plug 'neoclide/coc.nvim', {'branch': 'release'}
Plug 'OmniSharp/omnisharp-vim'
Plug 'preservim/nerdcommenter'
Plug 'roxma/vim-tmux-clipboard'
Plug 'sbdchd/neoformat'
Plug 'tpope/vim-fugitive'
Plug 'tpope/vim-repeat'
Plug 'tpope/vim-sleuth'
Plug 'vim-airline/vim-airline'
Plug 'vim-scripts/c.vim'
Plug 'zivyangll/git-blame.vim'

call plug#end()

" Use the Nord color scheme with true color support
colorscheme nord
set termguicolors

" Mouse support (that doesn't select text) for less embarrassing screen sharing
set mouse=nv
noremap <LeftMouse> ma<LeftMouse>`a

" Tell far to use ack
let g:far#source = 'acknvim'

" Disable netrw history
let g:netrw_dirhistmax = 0

" Show a set number of lines above and below the cursor
set scrolloff=10

" Don't color in the gutter
highlight clear SignColumn
highlight LineNr guibg=NONE

" Let tmux set active pane colors
hi Normal guibg=NONE ctermbg=NONE

" Use Escape to exit insert mode in the terminal
:tnoremap <Esc> <C-\><C-n>

" Set the filetype of common files
autocmd BufNewFile,BufRead .zshrc set filetype=sh " The ShellCheck GitHub Action sees this as a shell script
autocmd BufNewFile,BufRead .zshenv set filetype=sh
autocmd BufNewFile,BufRead .functionsrc set filetype=sh
autocmd BufNewFile,BufRead .aliasrc set filetype=sh
autocmd BufNewFile,BufRead .asciirc set filetype=sh
autocmd BufNewFile,BufRead *.rpy set filetype=python " Set the filetype of Ren'Py files

" Make Y yank the whole line like it did before
nnoremap Y yy

" Save and quit windows/buffers with all typo permutations
:command  W w
:command WQ wq
:command Wq wq
:command  Q q

" Alias for formatting
:command Format Neoformat

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

" Don't continue comments on to new lines automatically
autocmd BufNewFile,BufRead * setlocal formatoptions-=ro

" Configure template files that are autoloaded when creating a new file with a certain filename
au BufNewFile *.htm,*.html 0r ~/.templates/html.html
au BufNewFile *.sh,.*rc 0r ~/.templates/bash.sh
au BufNewFile *.yml,*.yaml 0r ~/.templates/yaml.yaml
au BufNewFile postmortem-*.md 0r ~/.templates/postmortem.md
au BufNewFile Dockerfile 0r ~/.templates/Dockerfile

" Enable a shortcut for inserting bash shebangs
command! Shebang :normal! i#!/usr/bin/env bash<CR><Esc>

" Generate a Markdown table of contents
command! Toc :GenTocGFM

" Make a shortcut for killing smart quotes
command! SmartQuotes :%s/’/'/ge | :%s/[“”]/"/ge

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

" coc.nvim tab to select completion
inoremap <silent><expr> <TAB>
      \ pumvisible() ? "\<C-n>" :
      \ <SID>check_back_space() ? "\<TAB>" :
      \ coc#refresh()
inoremap <expr><S-TAB> pumvisible() ? "\<C-p>" : "\<C-h>"
function! s:check_back_space() abort
  let col = col('.') - 1
  return !col || getline('.')[col - 1]  =~# '\s'
endfunction

" Tab between buffers
nnoremap <silent>   <tab> :if &modifiable && !&readonly && &modified <CR> :write<CR> :endif<CR>:bnext<CR>
nnoremap <silent> <s-tab> :if &modifiable && !&readonly && &modified <CR> :write<CR> :endif<CR>:bprevious<CR>

" Map fzf's file search to Control + P
nnoremap <C-P> :Files<CR>
tnoremap <C-P> :Files<CR>

" Map fzf's string search to Control + F
nnoremap <C-F> :Rg<Space>
tnoremap <C-F> :Rg<Space>

" Use ripgrep to search for the word under the cursor
nnoremap <silent> <Leader>rg :Rg <C-R><C-W><CR>

" Hide the fzf statusline when started inside a :terminal (the default in Neovim)
autocmd! FileType fzf set laststatus=0 noshowmode noruler
  \| autocmd BufLeave <buffer> set laststatus=2 showmode ruler

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
  \ 'border':  ['fg', 'Comment'],
  \ 'prompt':  ['fg', 'Conditional'],
  \ 'pointer': ['fg', 'Exception'],
  \ 'marker':  ['fg', 'Keyword'],
  \ 'spinner': ['fg', 'Label'],
  \ 'header':  ['fg', 'Comment'] }

" Automatically close Neovim when a terminal window closes and only an empty buffer is open (for use with my `v` terminal alias)
autocmd TermLeave * if line("$") == 1 && getline(1) == "" | q | endif

" Override text wrapping to not wrap long lines (I think, somehow, vim-sleuth is setting textwidth)
autocmd BufEnter * set textwidth=0

" Change location of saved swap files
set directory=/tmp

" Better movement between panes
nnoremap <C-J> <C-W><C-J>
nnoremap <C-K> <C-W><C-K>
nnoremap <C-L> <C-W><C-L>
nnoremap <C-H> <C-W><C-H>
set splitbelow
set splitright

" Automatically enable spellcheck for .md and .txt files and don't mark URL-like things as spelling errors
autocmd BufRead,BufNewFile *.md,*.txt setlocal spell | syn match UrlNoSpell '\w\+:\/\/[^[:space:]]\+' contains=@NoSpell
hi SpellBad ctermfg=236

" Show a guide for 120 character soft line wraps
set colorcolumn=120

" Show line numbers by default
set number

" Hide line numbers in the terminal
au TermOpen * setlocal nonumber norelativenumber

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

" Quickfix window shortcuts
map [q :cprevious<CR>
map ]q :cnext<CR>
map [Q :cfirst<CR>
map ]Q :clast<CR>
map [d :cdo<space>
map ]d :cdo<space>
nnoremap [a :cclose<CR>

" Locationlist window shortcuts
map [l :lprevious<CR>
map ]l :lnext<CR>
map [L :lfirst<CR>
map ]L :llast<CR>

" Run goimports instead of gofmt
let g:go_fmt_command = 'goimports'

" Don't use the quickfix list for language server errors
let g:LanguageClient_diagnosticsList = 'Location'

" Git blame config
command! Blame :call gitblame#echo()

" Go debugger shortcuts
nnoremap <silent> gds :GoDebugStart<CR>
nnoremap <silent> gdq :GoDebugStop<CR>
nnoremap <silent> gdt :GoDebugTest<CR>
nnoremap <silent> gdc :GoDebugContinue<CR>
nnoremap <silent> gdn :GoDebugNext<CR>
nnoremap <silent> gdi :GoDebugStep<CR>
nnoremap <silent> gdp :GoDebugPrint<space>
nnoremap <silent> gdb :GoDebugBreakpoint<CR>

" Configure LanguageClient
" Required for operations modifying multiple buffers like rename
set hidden
let g:LanguageClient_serverCommands = {
	      \ 'go': ['gopls'],
	      \ 'python': ['pyls'],
	      \ 'rust': ['~/.cargo/bin/rustup', 'run', 'stable', 'rls'],
	      \ 'yaml': ['yaml-language-server', '--stdio'],
	      \ 'sh': ['bash-language-server', 'start'],
    \ }

" General language server config
autocmd FileType go,rust,yaml,sh nnoremap <F5> :call LanguageClient_contextMenu()<CR>
autocmd FileType go,rust,yaml,sh nnoremap <silent> K :call LanguageClient#textDocument_hover()<CR>
autocmd FileType go,rust,yaml,sh nnoremap <silent> gd :call LanguageClient#textDocument_definition()<CR>
autocmd FileType go,rust,yaml,sh nnoremap <silent> gi :call LanguageClient#textDocument_implementation()<CR>
autocmd FileType go,rust,yaml,sh nnoremap <silent> gr :call LanguageClient#textDocument_references()<CR>
autocmd FileType go,rust,yaml,sh nnoremap <silent> <F2> :call LanguageClient#textDocument_rename()<CR>

" C# language server config
let g:OmniSharp_selector_findusages = 'fzf'
autocmd FileType cs nmap <silent> <buffer> gd <Plug>(omnisharp_go_to_definition)
autocmd FileType cs nmap <silent> <buffer> gi <Plug>(omnisharp_find_implementations)
autocmd FileType cs nmap <silent> <buffer> <F2> <Plug>(omnisharp_rename)
