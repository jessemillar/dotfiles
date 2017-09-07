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
		hs.execute("ln -s ~/Dropbox/Work/Dotfiles/proxyrc ~/.proxyrc")
		hs.execute("ln -s ~/Dropbox/Work/Dotfiles/npmrc ~/.npmrc")
		hs.execute("rm ~/.gitconfig && ln -s ~/Dropbox/Work/Dotfiles/gitconfig ~/.gitconfig")
	elseif currentSSID ~= workSSID and lastSSID == workSSID then
		-- we just left work wifi
		hs.execute("rm ~/.proxyrc")
		hs.execute("rm ~/.npmrc")
		hs.execute("rm ~/.gitconfig && ln -s ~/.dotfiles/.gitconfig ~/.gitconfig")
	end

	lastSSID = currentSSID
end

hs.wifi.watcher.new(ssidChangedCallback):start()

-- watch for unplugged headphones
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

hs.audiodevice.defaultOutputDevice():watcherCallback(audioCallback):watcherStart()
