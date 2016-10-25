module.exports = {
	config: {
		// default font size in pixels for all tabs
		fontSize: 12,

		// font family with optional fallbacks
		fontFamily: 'Menlo, "DejaVu Sans Mono", "Lucida Console", monospace',

		// terminal cursor background color and opacity (hex, rgb, hsl, hsv, hwb or cmyk)
		cursorColor: 'rgba(255,255,255,0.8)',

		// `BEAM` for |, `UNDERLINE` for _, `BLOCK` for █
		cursorShape: 'BLOCK',

		// color of the text
		foregroundColor: 'rgba(255,255,255,0.8)',

		// terminal background color
		backgroundColor: '#1e1e1e',

		// border color (window, tabs)
		borderColor: '#252525',

		// custom css to embed in the main window
		css: '',

		// custom css to embed in the terminal window
		termCSS: '',

		// custom padding (css format, i.e.: `top right bottom left`)
		padding: '12px 14px',

		// the full list. if you're going to provide the full color palette,
		// including the 6 x 6 color cubes and the grayscale map, just provide
		// an array here instead of a color map object
		colors: {
			black: '#000000',
			red: '#C75646',
			green: '#8EB33B',
			yellow: '#D0B03C',
			blue: '#72B3CC',
			magenta: '#C8A0D1',
			cyan: '#218693',
			white: '#b0b0b0',
			lightBlack: '#5D5D5D',
			lightRed: '#E09690',
			lightGreen: '#CDEE69',
			lightYellow: '#FFE377',
			lightBlue: '#9CD9F0',
			lightMagenta: '#FBB1F9',
			lightCyan: '#77DFD8',
			lightWhite: '#f7f7f7'
		},

		// the shell to run when spawning a new session (i.e. /usr/local/bin/fish)
		// if left empty, your system's login shell will be used by default
		shell: '/bin/zsh',

		// for setting shell arguments (i.e. for using interactive shellArgs: ['-i'])
		// by default ['--login'] will be used
		shellArgs: ['--login'],

		// for environment variables
		env: {},

		// set to false for no bell
		bell: 'SOUND',

		// if true, selected text will automatically be copied to the clipboard
		copyOnSelect: false

		// URL to custom bell
		// bellSoundURL: 'http://example.com/bell.mp3',

		// for advanced config flags please refer to https://hyperterm.org/#cfg
	},

	// a list of plugins to fetch and install from npm
	// format: [@org/]project[#version]
	// examples:
	//   `hyperpower`
	//   `@company/project`
	//   `project#1.0.1`
	plugins: ['hyperterm-themed-scrollbar','hyperterm-cursor'],

	// in development, you can create a directory under
	// `~/.hyperterm_plugins/local/` and include it here
	// to load it and avoid it being `npm install`ed
	localPlugins: []
};
