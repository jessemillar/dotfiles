-- open a terminal
hs.hotkey.bind({"ctrl"}, "return", function()
	hs.execute("open -na Hyper")
end)

-- open slack
hs.hotkey.bind({"ctrl", "shift"}, "S", function()
	hs.execute("open -na Slack")
end)

-- open spotify
hs.hotkey.bind({"ctrl", "shift"}, "P", function()
	hs.execute("open -na Spotify")
end)

-- open google chrome
hs.hotkey.bind({"ctrl", "shift"}, "C", function()
	hs.execute("open -na 'Google Chrome'")
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
	newSSID = hs.wifi.currentNetwork()

	if newSSID == workSSID and lastSSID ~= workSSID then
		-- we just joined work wifi
		hs.execute("mv ~/.envrcbak ~/.envrc")
		network:setLocation("Work")
	elseif newSSID ~= workSSID and lastSSID == workSSID then
		-- we just left work wifi
		hs.execute("mv ~/.envrc ~/.envrcbak")
		network:setLocation("Home/Other")
	end

	lastSSID = newSSID
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
