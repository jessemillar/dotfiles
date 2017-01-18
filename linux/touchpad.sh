#!/bin/bash

# Disable edge scrolling
synclient VertEdgeScroll=0

# Enable horizontal scrolling
synclient HorizTwoFingerScroll=1

# Invert touchpad scrolling
# Higher values equal slower scrolling
synclient VertScrollDelta=-300
synclient HorizScrollDelta=-400

# Decrease touchpad sensitivity
synclient FingerHigh=65
synclient FingerLow=60
