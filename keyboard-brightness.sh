#!/bin/sh
# Add the following to /etc/sudoers (using visudo)
# jessemillar	ALL=(root) NOPASSWD: /home/jessemillar/.dotfiles/keyboard-brightness.sh

KEYS_DIR=/sys/class/leds/smc\:\:kbd_backlight

test -d $KEYS_DIR || exit 0

MIN=0
MAX=$(cat $KEYS_DIR/max_brightness)
VAL=$(cat $KEYS_DIR/brightness)
INCREMENT=$(expr $MAX / 5)

if [ "$1" = down ]; then
	VAL=$((VAL-$INCREMENT))
else
	VAL=$((VAL+$INCREMENT))
fi

if [ "$VAL" -lt $MIN ]; then
	VAL=$MIN
elif [ "$VAL" -gt $MAX ]; then
	VAL=$MAX
fi

echo $VAL | sudo tee $KEYS_DIR/brightness
