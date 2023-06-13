// Get Package Data From Package.json - system.json | module.json
// Not using because rollup imports the file in a really weird way
// It imports each property as its own variable then creates a variable called PACKAGE
// With all of those variables as an object
//import PACKAGE from '../module.json' assert { type: 'json' };

export class MODULE {
	// Get Package ID
	static ID = 'kasper';

	// Get Localized Title, Defaults to English if i18n is not ready
	static TITLE = "👻 KASPER | Karma Assessment and Player Evaluation Resource";

	// Set Package Options
	static OPTIONS = {
		background: '#7030A0',
		color: '#fff'
	}

	// Check if Dev Mode is enabled
	static isDevMode = false;

	// Convert a string ID to a localized string
	static localize(stringId, data = {}) {
		// Prefix the string ID with the package identifier
		stringId = `${MODULE.ID}.${stringId}`;
		// Attempt to localize the string
		let v = foundry.utils.getProperty(game.i18n?.translations ?? {}, stringId);
		// Fall back to English if the string is not localized
		if (typeof v !== "string") v = foundry.utils.getProperty(game.i18n?._fallback ?? {}, stringId) || stringId;
		// Check If Data is Empty, if so return the string
		if (foundry.utils.isEmpty(data)) return (typeof v === "string") && v;
		// Replace the string with the data
		return Object.keys(data).reduce((acc, key) => acc.replace(`{${key}}`, data[key]), v);
	}

	// logger function
	static LOGGER = (logLevel, ...args) => {
		// If Dev Mode is disabled, don't log data to console
		if (MODULE.isDevMode === false) return false;

		// Define a list of log levels
		const logLevels = [
			{ title: 'ERROR', background: '#721c24', color: '#f8d7da', method: console.error },
			{ title: 'WARNING', background: '#856404', color: '#fff3cd', method: console.warn },
			{ title: 'DEBUG', background: '#0c5460', color: '#d1ecf1', method: console.log },
			{ title: 'INFO', background: '#004085', color: '#c6dafc', method: console.log },
			{ title: 'LOG', background: '#2b2d42', color: '#d6d8d9', method: console.log },
		]

		// Check if the log level is valid
		const logLevelIndex = logLevels.findIndex((level) => level.title.toLowerCase() === logLevel.toLowerCase() ?? "LOG") ?? logLevels.length - 1;
		if (!logLevels[logLevelIndex]) return (console.warn(`Invalid log level: ${logLevel}`), console.log(...args));

		// Check log level against Dev Mode setting and only log levels above the Dev Mode setting
		if (logLevelIndex >= MODULE.isDevMode) return false;

		// Get Console Log Level Data
		const { method, title, background, color } = logLevels[logLevelIndex];

		// Output to console
		method(
			`%c${MODULE.TITLE}%c${title}`,
			`background-color: ${MODULE.OPTIONS.background}; border-radius: 2px; color: ${MODULE.OPTIONS.color}; padding: 0.15rem 0.25rem;`,
			`background-color: ${background}; border-radius: 2px; color: ${color}; padding: 0.15rem 0.25rem; margin-left: 0.25rem;`,
			...args
		)
	}

	// Create Shorthand Methods for Logging
	static debug = (...args) => MODULE.LOGGER('DEBUG', ...args);
	static info = (...args) => MODULE.LOGGER('INFO', ...args);
	static warn = (...args) => MODULE.LOGGER('WARNING', ...args);
	static error = (...args) => MODULE.LOGGER('ERROR', ...args);
	static log = (...args) => MODULE.LOGGER('LOG', ...args);

	static setting = (...args) => {
		// Use destructuring to assign the values of args to variables
		let [operation, setting, value] = args;

		// Add type checks to ensure the correct types of arguments are passed in
		if (typeof operation !== 'string') return (MODULE.log('ERROR', 'The first argument must be a string'));

		// Handle the different operations
		switch (operation.toLowerCase()) {
			// Handle the register operation
			case 'register':
			case 'registermenu':
				// Check that a setting and value were provided
				if (typeof setting !== 'string') return (MODULE.log('ERROR', 'A setting name must be provided'));
				// Check that a value was provided and if not return an error with available options
				if (typeof value !== 'object') return (MODULE.log('ERROR', 'A setting value must be provided'));

				// Set default values for the properties of the setting
				const settingDefaults = {
					name: MODULE.localize(`settings.${setting}.name`),
					hint: MODULE.localize(`settings.${setting}.hint`),
				};

				// Add additional properties based on the operation
				if (operation.toLowerCase() === 'register') {
					// Set default values for the a setting
					mergeObject(settingDefaults, {
						scope: 'client',
						config: true,
						requiresReload: false
					});
				} else if (operation.toLowerCase() === 'registermenu') {
					// Check that a value was provided and if not return an error with available options
  					if (!(value?.type.prototype instanceof FormApplication)) return (MODULE.log('ERROR', 'You must provide a menu type that is FormApplication instance or subclass'));
					// Set default values for the a menu
					mergeObject(settingDefaults, {
						default: {},
						label: MODULE.localize(`settings.${setting}.label`),
						icon: 'fa-duotone fa-sliders',
						restricted: true
					});
				}

				// Merge the default values with the provided values
				const newSetting = mergeObject(settingDefaults, value, { inplace: false });

				// Register the new setting or menu
				if (operation.toLowerCase() === 'register') game.settings.register(MODULE.ID, setting, newSetting);
				else if (operation.toLowerCase() === 'registermenu') game.settings.registerMenu(MODULE.ID, setting, newSetting);

				// Return the new setting properties
				return newSetting;

			// Handle the update and get operations
			default:
				// Update setting and value if no operation is provided
				setting = args[0]; value = args[1];

				// Check if a value was provided
				try {
					if (typeof value !== 'undefined') return game.settings.set(MODULE.ID, setting, value);
					else return game.settings.get(MODULE.ID, setting);
				} catch (error) {
					// Log an error if the setting does not exist
					return (MODULE.log('ERROR', `Unable to ${typeof value !== 'undefined' ? 'set' : 'get'} setting: ${setting}`));
				}
		}
	}
}

// 🧙 DEVELOPER MODE HOOKS -> devModeReady
Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
	// Register Dev Mode Flag because its defaults are weird
    registerPackageDebugFlag(MODULE.ID, 'level', {
		choiceLabelOverrides: {
			0: 'NONE', 1: 'ERROR', 2: 'WARN', 3: 'DEBUG', 4: 'INFO', 5: 'ALL'
		}
	});
	// Set Dev Mode
	MODULE.isDevMode = game.modules.get('_dev-mode')?.api?.getPackageDebugValue(MODULE.ID, 'level') ?? false;
	// Log Dev Mode Ready
	MODULE.debug('INFO', 'DevMode Ready');
});

// Update Module Title with localized string once game.i18n is ready
Hooks.once('i18nInit', () => {
	MODULE.TITLE = MODULE.localize('title');
	MODULE.debug('i18nInit', `Module Title Updated`);
});