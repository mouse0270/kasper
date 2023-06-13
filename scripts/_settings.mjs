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
	MODULE.setting('register', 'globalDefaults', {
		type: Object,
		default: {
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
		},
		scope: 'world',
		config: false
	})
});

/* [
	{
		"uuid": '',
		"name": "Section 1",
		"factions": [
			uuid: '',
			name: '',
			reputation: 0
		]
	}
] */