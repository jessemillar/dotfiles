-- open a terminal
hs.hotkey.bind({"ctrl"}, "return", function()
	hs.execute("open -na Hyper")
end)

-- open spotify
hs.hotkey.bind({"ctrl", "shift"}, "P", function()
	hs.execute("open -na Spotify")
end)

-- open google chrome
hs.hotkey.bind({"ctrl", "shift"}, "C", function()
	hs.execute("open -na 'Google Chrome'")
end)

-- open google chrome without security
hs.hotkey.bind({"ctrl", "shift", "alt"}, "C", function()
	hs.execute("open -na 'Google Chrome' --args --disable-web-security --allow-file-access-from-files --user-data-dir")
end)

-- open intellij idea
hs.hotkey.bind({"ctrl", "shift"}, "I", function()
	hs.execute("open -na 'IntelliJ IDEA'")
end)

-- open verizon texting in a new window
hs.hotkey.bind({"ctrl", "shift"}, "V", function()
	hs.execute("open -na 'Google Chrome' --args --new-window 'https://web.vma.vzw.com/vma/webs2/Message.do'")
end)

-- open verizon texting
hs.hotkey.bind({"ctrl"}, "V", function()
	hs.execute("open -a 'Google Chrome' 'https://web.vma.vzw.com/vma/webs2/Message.do'")
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

-- watch for work wifi
wifiWatcher = nil
workSSID = "Eagle"
lastSSID = hs.wifi.currentNetwork()

function ssidChangedCallback()
	network = hs.network.configuration.open()
	currentSSID = hs.wifi.currentNetwork()

	-- show the current network in a notification
	if currentSSID then
		hs.alert(currentSSID)
	end

	if currentSSID == workSSID and lastSSID ~= workSSID then
		-- we just joined work wifi
		hs.execute("mv ~/.proxyrcbak ~/.proxyrc")
		hs.execute("rm ~/.gitconfig && ln -s ~/Dropbox/Work/Dotfiles/gitconfig ~/.gitconfig")
		network:setLocation("Work")
	elseif currentSSID ~= workSSID and lastSSID == workSSID then
		-- we just left work wifi
		hs.execute("mv ~/.proxyrc ~/.proxyrcbak")
		hs.execute("rm ~/.gitconfig && ln -s ~/.dotfiles/.gitconfig ~/.gitconfig")
		network:setLocation("Home/Other")
	end

	lastSSID = currentSSID
end

wifiWatcher = hs.wifi.watcher.new(ssidChangedCallback)
wifiWatcher:start()

-- watch for unplugged headphones
headphonesWatcher = nil

function audioCallback(uid, event)
	if event=="jack" then
		device = hs.audiodevice.findDeviceByUID(uid)

		if device:jackConnected() then
			hs.audiodevice.defaultOutputDevice():setMuted(false)
		else
			hs.audiodevice.defaultOutputDevice():setMuted(true)
		end
	end
end

headphonesWatcher = hs.audiodevice.defaultOutputDevice():watcherCallback(audioCallback)
headphonesWatcher:watcherStart()
