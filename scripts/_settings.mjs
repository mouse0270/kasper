// GET MODULE CORE
import { MODULE } from './_module.mjs';

// IMPORT DIALOGS
import { Manager } from './dialogs/manager.mjs';
import { Configure } from './dialogs/configure.mjs';

// FOUNDRY HOOKS -> SETUP
Hooks.once('setup', async () => {
	MODULE.setting('register', 'storage', {
		type: Object,
		default: [],
		scope: 'world',
		config: false
	});

	MODULE.setting('register', 'trigger', {
		type: String,
		default: 'dialog',
		restricted: true,
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
			if (value === 'pinned') new Manager({}).render(true);
			else Object.entries(ui.windows).find(w => w[1].id == `${MODULE.ID}-manager`)?.[1]?.close() ?? false;
		}
	})

	MODULE.setting('register', 'minify', {
		type: Boolean,
		default: false,
		restricted: true,
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

	MODULE.setting('registerMenu', 'config', { type: Configure });
	
	// Define Standard Presets
	const PRESETS = [
		// Default Settings
		{
			key: 'globalDefaults',
			name: MODULE.localize(`TIERS.generic.title`),
			settings: {
				min: -100, max: 100, step: 1, default: 0, colorize: true,
				tiers: [
					[-75, MODULE.localize(`TIERS.generic.labels.Infamous`)],
					[-55, MODULE.localize(`TIERS.generic.labels.Exalted`)],
					[-35, MODULE.localize(`TIERS.generic.labels.Hated`)],
					[-15, MODULE.localize(`TIERS.generic.labels.Feared`)],
					[15, MODULE.localize(`TIERS.generic.labels.Neutral`)],
					[35, MODULE.localize(`TIERS.generic.labels.Friendly`)],
					[55, MODULE.localize(`TIERS.generic.labels.Allied`)],
					[75, MODULE.localize(`TIERS.generic.labels.Respcted`)],
					[100, MODULE.localize(`TIERS.generic.labels.Revered`)],
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

	MODULE.setting('register', 'globalDefaults', {
		type: Object,
		default: { preset: PRESETS.find(p => p.key === 'globalDefaults').key },
		scope: 'world',
		config: false
	});

	// TODO: This has to be a world setting, otherwise if you create new presets but switch to a different computer, your trackors would break because its unaware that that preset exist on the other computer
	MODULE.setting('register', 'presets', {
		type: Object,
		default: PRESETS,
		scope: 'world',
		config: false
	});

	MODULE.setting('register', 'example', {
		type: Object,
		default: PRESETS,
		scope: 'world',
		config: false,
		persistant: true
	});
});