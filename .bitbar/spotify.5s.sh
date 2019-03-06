#!/bin/bash

# Send a series of semicolon-delimited commands to Spotify
function tellspotify() {
  commands="$(echo "$1" | tr ";" "\\n")"

  osascript -e "
            tell application \"Spotify\"
                $commands
            end tell";
}

if [ "$(osascript -e 'application "Spotify" is running')" = "false" ]; then
  echo "♪"
  echo "---"
  echo "Spotify is not running"
  exit
fi

## Get Spotify info

icon="♪"
state=$(tellspotify 'player state as string');
track=$(tellspotify 'name of current track as string');
artist=$(tellspotify 'artist of current track as string');
album=$(tellspotify 'album of current track as string');

## Print the display

if [ "$state" = "playing" ]; then
	echo "$track - $artist $icon"
else
  echo "♪"
fi

echo "---"

echo -e "Track:\\t$track"
echo -e "Artist:\\t$artist"
echo -e "Album:\\t$album"
