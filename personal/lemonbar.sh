#!/bin/bash

# foreground lemon bar color definitions
fg_white1="%{F#f7f7f7}"

# foreground color definitions
fg_green="%{F#89e70d}"
fg_yellow="%{F#e7d90d}"
fg_red="%{F#e83099}"

# lemon bar SPACINGarator
SPACING="  "

# define the clock
clock() {
	date=$(date +"%m.%d.%y %I:%M %p")

	echo "$date "
}

# get current backlight info
backlight() {
	light -s mba6x_backlight
}

# grab battery information
battery() {
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
volume() {
	echo $(amixer get Master | awk '$0~/%/{print $4}' | tr -d '[]')
}

# grab music information
music() {
	echo $(spotify-now -i "%title")
}

# grab wifi info
wifi() {
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
workspace() {
	echo " "$(bspc query -D -d --names)
}

# print line for lbar; runs indefinitely
while true
do
	# output to lemonbar
	echo "${fg_white1}$(workspace)$SPACING\
		$(music)$SPACING\
		%{r}${fg_white1}\
		$(backlight)$SPACING\
		$(volume)$SPACING\
		$(wifi)$SPACING\
		$(battery)$SPACING\
		$(clock)\
		%{F-}%{B-}"

	# wait 1 second before running loop again
	sleep 1;
done