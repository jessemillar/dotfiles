#!/bin/sh

BACKGROUND="#80ffffff"

clock() {
	date +%a,\ %h%e%l:%M\ %p
}

battery() {
	acpi
}

while true
do
	echo "%{l}%{B$BACKGROUND} $(battery)% %{r}%{B$BACKGROUND}$(clock) "
	sleep 1
done
