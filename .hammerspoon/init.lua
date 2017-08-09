-- reload config files
function reloadConfig(files)
	doReload = false

	for _,file in pairs(files) do
		if file:sub(-4) == ".lua" then
			doReload = true
		end
	end

	if doReload then
		startEyeTimer(hs.caffeinate.watcher.sessionDidBecomeActive)
		hs.reload()
	end
end

-- watch for changes to the config files
hs.pathwatcher.new(os.getenv("HOME") .. "/.hammerspoon/", reloadConfig):start()

eyeTimer = nil

-- remind me to look away from the computer
-- set the notification type for hammerspoon in system preferences to "alerts" to have a close button
function startEyeTimer(eventType)
	if eventType == hs.caffeinate.watcher.sessionDidBecomeActive then
		eyeTimer = hs.timer.doAfter(20 * 60, function()
			hs.notify.new({
				title="AVERT YOUR EYES",
				informativeText="Stare wistfully into the distance for 20 seconds",
				hasActionButton=false,
				callback=startEyeTimer(hs.caffeinate.watcher.sessionDidBecomeActive)
			}):send()
		end)
	elseif eventType == hs.caffeinate.watcher.sessionDidResignActive then
		eyeTimer:stop()
	end
end

-- watch for unlock events to start the eye timer
hs.caffeinate.watcher.new(startEyeTimer):start()

-- restart my window manager
function restartChunkwm(eventType)
	if not eventType then
		hs.execute("brew services restart chumkwm")
	end
end

-- watch for monitors being (un)plugged
hs.screen.watcher.new(restartChunkwm):start()

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
		network:setLocation("Work")
	elseif currentSSID ~= workSSID and lastSSID == workSSID then
		-- we just left work wifi
		hs.execute("rm ~/.proxyrc")
		hs.execute("rm ~/.npmrc")
		hs.execute("rm ~/.gitconfig && ln -s ~/.dotfiles/.gitconfig ~/.gitconfig")
		network:setLocation("Home/Other")
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
