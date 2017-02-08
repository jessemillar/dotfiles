#!/bin/bash

# background lemon bar color definitions
bg_black1="%{B#000000}"
bg_black2="%{B#1a1a1a}"

# foreground lemon bar color definitions
fg_white1="%{F#f7f7f7}"
fg_white2="%{F#e5e5e5}"
fg_white3="%{F#6b6b6b}"

# background color definitions
bg_green="%{B#477807}"
bg_yellow="%{B#787107}"

# foreground color definitions
fg_green="%{F#89e70d}"
fg_yellow="%{F#e7d90d}"
fg_red="%{F#e83099}"

fg_blue1="%{F#0d89e7}"
fg_blue2="%{F#305069}"

# volume color definitions; from lightest to darkest
bg_white4="%{B#666666}"
bg_white3="%{B#4d4d4d}"
bg_white2="%{B#333333}"

# lemon bar separator
sep="   "

# define the clock
Clock() {
	date=$(date +"%m.%d.%y %I:%M %p")

	echo "$date "
}

# grab battery information
Battery() {
	# grab current battery status from acpi using cut and sed
	# sed removes whitespace and %
	# cut picks a delimiter, then a field
	bat="$(acpi -b | cut -d, -f2 | sed 's/ //g;s/%//g')"

	# color battery output based on percentage
	# battery is <= 50
	if [ $bat -le 25 ]; then
		bat_output=" ${fg_red} ${bat}%{F-} "

		# battery is <=50
	elif [ $bat -le 50 ]; then
		bat_output=" ${fg_yellow} ${bat}%{F-} "

		# battery is <=75
	elif [ $bat -le 75 ]; then
		bat_output=" ${fg_green} ${bat}%{F-} "

		# battery is <=100
	elif [ "$bat" -le 100 ]; then
		bat_output="  ${bat} "

		# error message
	else
		bat_output="null"

	fi

	echo "$bat_output%"
}

# grab volume information
Volume() {
	# grab volume and strip of [%]
	vol=$(amixer sget Master | grep 'Front Left:' | awk '{print $5}' | \
		sed 's/\[//g;s/\]//g;s/\%//g')

	# grab mute status and strip of []
	state=$(amixer sget Master | grep 'Front Left:' | awk '{print $6}' | \
		sed 's/[^a-z]//g')

	# check for mute
	if [[ $state == "on" ]]; then
		output="  ${vol} "

	else
		output="  mute "

	fi

	echo "$output"
}

# grab wifi info
Wifi() {
	# grab wifi status and run through sed
	wifi="$(iwconfig wlan0 | sed -n 's/"//g; s/\s*$//g; s/.*ESSID://p')"

	# check if wifi isn't connected
	if [ "$wifi" == "off/any" ]; then
		wifi_output=""
	else
		wifi_output=" ${wifi}"
	fi

	echo "$wifi_output"
}

# set current workspace
Workspace() {
	echo " "$(bspc query -D -d --names)
}

# print line for lbar; runs indefinitely
while true
do
	# output to lemonbar
	echo "${fg_white1}$(Workspace)%{l}\
		%{r}${fg_white1}\
		$(Wifi)${sep}\
		$(Battery)${sep}\
		$(Clock)\
		%{F-}%{B-}"

	# wait 1 second before running loop again
	sleep 1;
done
