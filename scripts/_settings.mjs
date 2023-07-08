// GET MODULE CORE
import { MODULE } from './_module.mjs';

// IMPORT DIALOGS
import { ManagerApp } from './dialogs/manager.mjs';
import { ConfigureApp } from './dialogs/configure.mjs';

// FOUNDRY HOOKS -> SETUP
Hooks.once('setup', async () => {
	// === REGISTER MODULE SETTINGS ===
	// Register the Configuration Menu so that users can configure, create, delete, and import/export presets
	// TODO:Add the ability to Delete and Import/Export Presets
	MODULE.setting('registerMenu', 'config', { type: ConfigureApp });

	// Define setting to store reputation values
	MODULE.setting('register', 'storage', {
		type: Object,
		default: [],
		scope: 'world',
		config: false,
		onChange: (value, options, userId) => {
			// Only Update if not for user making change
			if (game.user.id === userId) return;

			// Get Window and Update Data
			let window = Object.entries(ui.windows).find(w => w[1].id == `${MODULE.ID}-manager`)?.[1] ?? false;
			if (window) window.vue.session.reputations = value;
		}
	});

	// Define setting to indicate how the module should be displayed
	// - dialog: Display the module as a dialog
	// - pinned: Display the module inside the Journal Sidebar
	MODULE.setting('register', 'trigger', {
		type: String,
		default: 'dialog',
		choices: {
			'dialog': `${MODULE.ID}.settings.trigger.choices.dialog`,
			'pinned': `${MODULE.ID}.settings.trigger.choices.pinned`
		},
		onChange: (value) => {
			// If the trigger is set to dialog, add button to Jounal Sidebar Header
			document.querySelectorAll(`button[data-action="open-${MODULE.ID}"]`).forEach(elem => {
				elem.style.display = value === 'dialog' ? 'block' : 'none';
			});

			// If the trigger is set to pinned, open the manager window
			if (value === 'pinned') new ManagerApp({}).render(true);
			else Object.entries(ui.windows).find(w => w[1].id == `${MODULE.ID}-manager`)?.[1]?.close() ?? false;
		}
	})
	// Define setting to indicate if the module should be minimized
	// - Will adjust the css to have a more compact view
	MODULE.setting('register', 'minify', {
		type: Boolean,
		default: false,
		onChange: (value) => {
			// Get the manager window or return false
			let window = Object.entries(ui.windows).find(w => w[1].id == `${MODULE.ID}-manager`)?.[1] ?? false;

			// If the manager window is not open, return
			if (!window) return;

			// Toggle the minify class on the manager window
			window?.element?.[0].classList.toggle('minify', value);
			setTimeout(() => { window.setPosition({ height: 'auto' }); }, 1);
		}
	});

	// Define if Mouse Wheel should adjust the value by default
	// - false: Value will not be adjusted unless user holds ctrl
	// - true: (NOT SUGGESTED) Range input will be handled by foundry
	// ? This may cause issues with other modules that also effect range input behavior. If so, enable this setting to let foundry/modules handle the input.
	// Get disable-mouse-wheel-sliders module
	// - If it is enabled, show hint disabled localization
	const disableMouseWheelSliders = game.modules.get('disable-mouse-wheel-sliders') ?? {};
	MODULE.setting('register', 'disableWheel', {
		type: Boolean,
		default: true,
		config: game.user.isGM,
		// If disable-mouse-wheel-sliders is enabled, show hint disabled localization
		// Otherwise, show hint localization
		hint: (disableMouseWheelSliders?.active ?? false) ? MODULE.localize('settings.disableWheel.hintDisabled', {moduleTitle: disableMouseWheelSliders?.title }) :  MODULE.localize('settings.disableWheel.hint')
	});

	// If disable-mouse-wheel-sliders is enabled
	// When user opens the Settings Config window, find setting and disable it.
	if (game.user.isGM && (disableMouseWheelSliders?.active ?? false)) {
		Hooks.on('renderSettingsConfig', (app, [elem], data) => {
			MODULE.debug('Disabling Mouse Wheel Setting', elem.querySelector(`input[name="${MODULE.ID}.disableWheel"]`));
			elem.querySelector(`input[name="${MODULE.ID}.disableWheel"]`).disabled = true;
		});
	}
	
	// Define Standard Presets
	let PRESETS = [
		// Default Settings
		{
			key: 'generic',
			name: MODULE.localize(`TIERS.generic.title`),
			settings: {
				min: -100, max: 100, step: 1, default: 0, colorize: true,
				tiers: [
					[-75, MODULE.localize(`TIERS.generic.labels.Loathed`)],
					[-55, MODULE.localize(`TIERS.generic.labels.Despised`)],
					[-35, MODULE.localize(`TIERS.generic.labels.Hated`)],
					[-15, MODULE.localize(`TIERS.generic.labels.Scorned`)],
					[15, MODULE.localize(`TIERS.generic.labels.Neutral`)],
					[35, MODULE.localize(`TIERS.generic.labels.Friendly`)],
					[55, MODULE.localize(`TIERS.generic.labels.Allied`)],
					[75, MODULE.localize(`TIERS.generic.labels.Respcted`)],
					[100, MODULE.localize(`TIERS.generic.labels.Revered`)],
				]
			}
		},  
		// Pathfinder 2e Reputations
		{
			key: 'pf2e-reputations',
			name: MODULE.localize(`TIERS.pf2e-reputations.title`),
			settings: {
				min: -50, max: 50, step: 1, default: 0, colorize: true,
				tiers: [
					[-30, MODULE.localize(`TIERS.pf2e-reputations.labels.Hunted`)],
					[-15, MODULE.localize(`TIERS.pf2e-reputations.labels.Hated`)],
					[-5, MODULE.localize(`TIERS.pf2e-reputations.labels.Disliked`)],
					[4, MODULE.localize(`TIERS.pf2e-reputations.labels.Ignored`)],
					[14, MODULE.localize(`TIERS.pf2e-reputations.labels.Liked`)],
					[29, MODULE.localize(`TIERS.pf2e-reputations.labels.Admired`)],
					[50, MODULE.localize(`TIERS.pf2e-reputations.labels.Revered`)]
				]
			}
		}, 
		// Simple Settings
		{
			key: 'simple',
			name: MODULE.localize(`TIERS.simple.title`),
			settings: {
				min: -10, max: 10, step: 1, default: 0, colorize: true,
				tiers: [
					[-5, MODULE.localize(`TIERS.simple.labels.Enemy`)],
					[5, MODULE.localize(`TIERS.simple.labels.Neutral`)],
					[10, MODULE.localize(`TIERS.simple.labels.Friendly`)],
				]
			}
		}, 
		// Solider Ranks
		{
			key: 'soliderRanks',
			name: MODULE.localize(`TIERS.solider-ranks.title`),
			settings: {
				min: 0, max: 14, step: 1, default: 0, colorize: false,
				tiers: [
					[0, MODULE.localize(`TIERS.solider-ranks.labels.Unlisted`)],
					[1, MODULE.localize(`TIERS.solider-ranks.labels.Private`)],
					[2, MODULE.localize(`TIERS.solider-ranks.labels.Corporal`)],
					[3, MODULE.localize(`TIERS.solider-ranks.labels.Sergeant`)],
					[4, MODULE.localize(`TIERS.solider-ranks.labels.MasterSergeant`)],
					[5, MODULE.localize(`TIERS.solider-ranks.labels.SecondLieutenant`)],
					[6, MODULE.localize(`TIERS.solider-ranks.labels.FirstLieutenant`)],
					[7, MODULE.localize(`TIERS.solider-ranks.labels.Captain`)],
					[8, MODULE.localize(`TIERS.solider-ranks.labels.Major`)],
					[9, MODULE.localize(`TIERS.solider-ranks.labels.Colonel`)],
					[10, MODULE.localize(`TIERS.solider-ranks.labels.BrigadierGeneral`)],
					[11, MODULE.localize(`TIERS.solider-ranks.labels.MajorGeneral`)],
					[12, MODULE.localize(`TIERS.solider-ranks.labels.LieutenantGeneral`)],
					[13, MODULE.localize(`TIERS.solider-ranks.labels.General`)],
					[14, MODULE.localize(`TIERS.solider-ranks.labels.Commander`)]
				]
			}
		}, 
		// Fallout
		{
			key: 'fallout',
			name: MODULE.localize(`TIERS.fallout.title`),
			settings: {
				min: -1000, max: 1000, step: 1, default: 0, colorize: true,
				tiers: [
					[-750, MODULE.localize(`TIERS.fallout.labels.VeryBad`)],
					[-250, MODULE.localize(`TIERS.fallout.labels.Bad`)],
					[249, MODULE.localize(`TIERS.fallout.labels.Neutral`)],
					[750, MODULE.localize(`TIERS.fallout.labels.Good`)],
					[1000, MODULE.localize(`TIERS.fallout.labels.VeryGood`)],
				]
			}
		}, 
		// A House Divided (https://foundryvtt.com/packages/house-divided)
		{
			key: 'house-divided',
			name: MODULE.localize(`TIERS.house-divided.title`),
			settings: {
				min: -10, max: 10, step: 1, default: 0, colorize: true,
				tiers: [
					[-7, MODULE.localize(`TIERS.house-divided.labels.Despised`)],
					[-4, MODULE.localize(`TIERS.house-divided.labels.Scorned`)],
					[-1, MODULE.localize(`TIERS.house-divided.labels.Unfriendly`)],
					[0, MODULE.localize(`TIERS.house-divided.labels.Neutral`)],
					[3, MODULE.localize(`TIERS.house-divided.labels.Friendly`)],
					[6, MODULE.localize(`TIERS.house-divided.labels.Loyal`)],
					[9, MODULE.localize(`TIERS.house-divided.labels.Devoted`)]
				]
			}
		}
	];
	// Set Global Defaults
	PRESETS = [mergeObject({ ...PRESETS[0] }, { 
		key: 'globalDefaults',
		name: MODULE.localize(`TIERS.globalDefaults.title`),
	})].concat(PRESETS);
	// Register the globalDefaults Preset for easy access
	MODULE.setting('register', 'globalDefaults', {
		type: Object,
		default: { preset: PRESETS.find(p => p.key === 'globalDefaults').key },
		scope: 'world',
		config: false
	});

	// Register setting to Store Default and user created presets
	// TODO: This has to be a world setting, otherwise if you create new presets but switch to a different computer, your trackors would break because its unaware that that preset exist on the other computer
	MODULE.setting('register', 'presets', {
		type: Object,
		default: PRESETS,
		scope: 'world',
		config: false
	});

	// If the preset is empty, set it to the default
	Hooks.on('ready', () => { 
		if (MODULE.setting('presets').length === 0) MODULE.setting('presets', PRESETS);
	})
});
