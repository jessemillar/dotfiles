#!/bin/sh

BACKGROUND="#80ffffff"

clock() {
	date +%H:%M:%S
}

battery() {
	cat /sys/class/power_supply/BAT0/capacity
}

while true
do
	echo "%{l}%{B$BACKGROUND} LIFE : $(battery)% %{r}%{B$BACKGROUND}TIME : $(clock) "
	sleep 1
done
