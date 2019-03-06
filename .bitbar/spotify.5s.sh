#!/bin/bash

# This is a simplification of https://github.com/matryer/bitbar-plugins/blob/master/Music/spotify.10s.sh
icon="♪"

# Send a command to Spotify
function tellspotify() {
  osascript -e "
            tell application \"Spotify\"
                $1
            end tell";
}

# Show just an icon if Spotify isn't running
if [ "$(osascript -e 'application "Spotify" is running')" = "false" ]; then
  echo $icon
  echo "---"
  echo "Spotify is not running"
  exit
fi

## Get Spotify info
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

# Print submenu items
echo "---"
echo -e "Track:\\t$track"
echo -e "Artist:\\t$artist"
echo -e "Album:\\t$album"
