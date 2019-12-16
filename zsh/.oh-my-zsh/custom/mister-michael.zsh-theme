_michael_collapsed_wd() {
	echo $(pwd | perl -pe '
		BEGIN {
			binmode STDIN,  ":encoding(UTF-8)";
			binmode STDOUT, ":encoding(UTF-8)";
		}; s|^$ENV{HOME}|~|g; s|/([^/.])[^/]*(?=/)|/$1|g; s|/\.([^/])[^/]*(?=/)|/.$1|g
	')
}

_hostname_icon() {
	case "$(hostname)" in
		terminal-vm*)
			echo "🐧"
			;;
		MININT*)
			echo "🦓"
			;;
		*)
			echo "❓"
			;;
	esac
}

local user_color='magenta'; [ $UID -eq 0 ] && user_color='red'
PROMPT='$(_hostname_icon) %{$fg[$user_color]%}$(_michael_collapsed_wd) %{$fg[cyan]%}%(!.#.>)  %{$reset_color%}'
PROMPT2='%{$fg[red]%}\ %{$reset_color%}'

local return_status="%{$fg_bold[red]%}%(?..%?)%{$reset_color%}"
RPROMPT='$(vi_mode_prompt_info)${return_status}%{$fg[cyan]%}$(git_prompt_info)$(git_prompt_status)%{$reset_color%}'

MODE_INDICATOR="%{$fg_bold[red]%}NORM"

ZSH_THEME_GIT_PROMPT_PREFIX=" "
ZSH_THEME_GIT_PROMPT_SUFFIX=""
ZSH_THEME_GIT_PROMPT_DIRTY=""
ZSH_THEME_GIT_PROMPT_CLEAN=""

ZSH_THEME_GIT_PROMPT_ADDED="%{$fg_bold[green]%}+"
ZSH_THEME_GIT_PROMPT_MODIFIED="%{$fg_bold[blue]%}!"
ZSH_THEME_GIT_PROMPT_DELETED="%{$fg_bold[red]%}-"
ZSH_THEME_GIT_PROMPT_RENAMED="%{$fg_bold[magenta]%}>"
ZSH_THEME_GIT_PROMPT_UNMERGED="%{$fg_bold[yellow]%}#"
ZSH_THEME_GIT_PROMPT_UNTRACKED="%{$fg_bold[cyan]%}?"
