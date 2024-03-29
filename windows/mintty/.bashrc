alias gbstudio="cd ~/Documents/gb-studio && npm start"

# Remove garbage macOS files
alias mac='find . -name '.DS_Store' -depth -exec rm {} \;; find . -type d -name '.Spotlight-V100' -exec rm -rf {} \;; find . -type d -name '.Trashes' -exec rm -rf {} \;; find . -type d -name '__MACOSX' -exec rm -rf {} \;; echo "Done"'

# General aliases
alias bashrc="vi ~/dotfiles/windows/mintty/.bashrc"
alias l="ls -la"
alias rc="source ~/.bash_profile"
alias v="vi"
alias warprc="vi ~/dotfiles/windows/mintty/.warprc"

# git (there are also a few functions defined in .functionsrc)
alias ga="git add"
alias gb="git branch -a"
alias gbd="git branch -D"
alias gc="git checkout"
alias gcb="git checkout -b"
alias gcl="git clone"
alias gcm="git checkout master"
alias gda="git diff"
alias gdc="git --no-pager diff --check"
alias gf="gh repo fork"
alias gfix="git diff --name-only | uniq | xargs nvim"
alias gi="gh issue create --assignee jessemillar"
alias gil="gh issue list"
alias gl="git log"
alias gla="git log | ack"
alias gp="git pull"
alias gpu="git push"
alias gput="git push --tags"
alias gr="git remote -v"
alias grh="git fetch origin && git reset --hard origin/master"
alias grhh="git reset --hard HEAD"
alias grm="git ls-files -c -i --exclude-from=.gitignore | xargs git rm --cached"
alias grs="git remote set-url origin"
alias gs="git status"
alias gsa="git stash apply"
alias gsh="git show"
alias gsc="git stash clear"
alias gsu="git stash -u"
alias gt="git tag"
alias gtl="git tag -l"
alias gv="gh repo view"

# Functions
## General
function npp() {
	start ~/Documents/npp/notepad++.exe "$1"
}

## Git Functions
function ghours() {
	timestamps=$(git log --date=iso-strict | grep Date | cut -c9- | tac)
	last_timestamp=""
	total_seconds=0

	one_hour=$((60*60))
	thirty_minutes=$((30*60))

	while IFS= read -r line
	do
	    if test -z "$last_timestamp"
	    then
		last_timestamp="$line"
	    else
		time_difference=$(($(date +%s -d "$line")-$(date +%s -d "$last_timestamp")))
		if [ "$time_difference" -gt $one_hour ];
		then
		    total_seconds=$((total_seconds+thirty_minutes))
		else
		    total_seconds=$((total_seconds+time_difference))
		fi

		last_timestamp="$line"
	    fi
	done <<< "$timestamps"

	echo $((total_seconds/one_hour))
}

# cd to the root of the current repository
function root() {
	cd "$(git rev-parse --show-toplevel)" || return
}

function gd() {
	if test -f "diff.sh"; then
		./diff.sh
	else
		git diff
	fi
}

# Quickly merge the current branch with a supplied branch (or master if no branch is supplied)
function gm() {
	branch=$(git rev-parse --abbrev-ref HEAD)

	if [[ -z "$1" ]]
	then
		git checkout master && git pull && git checkout "$branch" && git merge master
	else
		git checkout "$1" && git pull && git checkout "$branch" && git merge "$1"
	fi
}

# Add all git changes with a commit message and push to remote
function g() {
	if [ -z "$1" ]
	then
		echo "No commit message supplied"
	else
		if test -f "pre-commit.sh"; then
			./pre-commit.sh
		fi

		git add -A
		git commit -m "$1"
		git push -u
	fi
}

# Add a commit message to already-staged git changes with a commit message and push to remote
function G() {
	if [ -z "$1" ]
	then
		echo "No commit message supplied"
	else
		git commit -m "$1"
		git push -u
	fi
}
