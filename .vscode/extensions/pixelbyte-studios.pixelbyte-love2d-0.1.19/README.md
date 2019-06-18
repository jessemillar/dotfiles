# Functionality

* Supports running [Love2D](http://love2d.org) projects directly from VSCode.

* Intellisense for the Love2D API.

* Command for opening Love2D web help for Love2D function under the cursor

* Ability to toggle auto re-running Love2D project on save

* Ability to debug print() statements in a separate cmd line window (Windows OS only)

# Installation

Press `F1` in VSCode, type `ext install` and then look for `pixelbyte-love2d`.

#Usage

## Keybindings

* Run Love2D on the current project folder:
```
  Win: {"key": "Alt+L,", "command":"pixelbyte.love2d.run"}
MacOS: {"key": "cmd+L,", "command":"pixelbyte.love2d.run"}
```

* Toggle the run Love2D on save feature:
```
  Win: {"key": "Ctrl+Alt+L,", "command":"pixelbyte.love2d.runOnsave.toggle"}
MacOS: {"key": "Ctrl+cmd+L,", "command":"pixelbyte.love2d.runOnsave.toggle"}
```

* Toggle showing the debug console on Love2D execution
```
{"key": "Ctrl+Shift+L,", "command":"pixelbyte.love2d.debug.toggle"}
```

* Open the Love2D help page for the function under the cursor
```
{"key": "F2", "command":"pixelbyte.love2d.help"}
```

## Available Settings
* Set the path to the Love2D executable:
```
"pixelbyte.love2d.path" : "C:\Program Files\Love\love.exe"
```

* Show debug console (Windows only):
```
"pixelbyte.love2d.debug": true
```

* Run Love2D on file save:
```
"pixelbyte.love2d.runOnSave" : false
```

* Change the default search directory for main.lua from the project root to the given relative directory
```
"pixelbyte.love2d.srcDir" : "src"
```