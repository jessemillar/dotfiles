module.exports = {
	config: {
		// default font size in pixels for all tabs
		fontSize: 12,

		// font family with optional fallbacks
		fontFamily: 'Menlo, "DejaVu Sans Mono", "Lucida Console", monospace',

		// `BEAM` for |, `UNDERLINE` for _, `BLOCK` for █
		cursorShape: 'BLOCK',

		// custom padding (css format, i.e.: `top right bottom left`)
		padding: '12px',

		// the shell to run when spawning a new session (i.e. /usr/local/bin/fish)
		// if left empty, your system's login shell will be used by default
		shell: '/bin/zsh',

		// for setting shell arguments (i.e. for using interactive shellArgs: ['-i'])
		// by default ['--login'] will be used
		shellArgs: ['--login'],

		// set to false for no bell
		bell: false,

		// if true, selected text will automatically be copied to the clipboard
		copyOnSelect: true,

		termCSS: `
			x-screen a {
				color: #ff79c6;
			}
		`
	},

	// a list of plugins to fetch and install from npm
	// format: [@org/]project[#version]
	// examples:
	//   `hyperpower`
	//   `@company/project`
	//   `project#1.0.1`
	plugins: ['hyperterm-alternatescroll', 'hyperterm-cursor', 'hyperminimal', 'hyper-dracula'],

	// in development, you can create a directory under
	// `~/.hyperterm_plugins/local/` and include it here
	// to load it and avoid it being `npm install`ed
	localPlugins: []
};
