#!/bin/bash

# Invert touchpad scrolling
# Higher values equal slower scrolling
synclient VertScrollDelta=-300
synclient HorizScrollDelta=-300

# Decrease touchpad sensitivity
synclient FingerHigh=65
synclient FingerLow=60
