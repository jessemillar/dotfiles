-- open a terminal
hs.hotkey.bind({"alt"}, "return", function()
  hs.execute("open -na Hyper")
end)

-- open slack
hs.hotkey.bind({"alt"}, "S", function()
  hs.execute("open -na Slack")
end)

-- open spotify
hs.hotkey.bind({"alt"}, "P", function()
  hs.execute("open -na Spotify")
end)

-- open google chrome
hs.hotkey.bind({"alt"}, "C", function()
  hs.execute("open -na 'Google Chrome'")
end)

-- open verizon texting in a new window
hs.hotkey.bind({"alt", "shift"}, "V", function()
  hs.execute("open -na 'Google Chrome' --args --new-window 'https://web.vma.vzw.com/vma/webs2/Message.do'")
end)

-- open verizon texting
hs.hotkey.bind({"alt"}, "V", function()
  hs.execute("open -a 'Google Chrome' 'https://web.vma.vzw.com/vma/webs2/Message.do'")
end)

-- open trello in a new window
hs.hotkey.bind({"alt", "shift"}, "R", function()
  hs.execute("open -na 'Google Chrome' --args --new-window 'https://trello.com'")
end)

-- open trello
hs.hotkey.bind({"alt"}, "R", function()
  hs.execute("open -a 'Google Chrome' 'https://trello.com'")
end)

-- open google inbox in a new window
hs.hotkey.bind({"alt", "shift"}, "E", function()
  hs.execute("open -na 'Google Chrome' --args --new-window 'https://inbox.google.com'")
end)

-- open google inbox
hs.hotkey.bind({"alt"}, "E", function()
  hs.execute("open -a 'Google Chrome' 'https://inbox.google.com'")
end)

-- reload config files
function reloadConfig(files)
    doReload = false
    for _,file in pairs(files) do
        if file:sub(-4) == ".lua" then
            doReload = true
        end
    end
    if doReload then
        hs.reload()
    end
end

-- watch for changes to the config files
hs.pathwatcher.new(os.getenv("HOME") .. "/.hammerspoon/", reloadConfig):start()
