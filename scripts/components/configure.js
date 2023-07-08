// GET MODULE CORE
import { MODULE } from '../_module.mjs';

// IMPORT VUE DIALOGS
import { VueDialog } from '../lib/components/dialog.js';

export const Configure = {
	data() {
		return {
			ModuleID: MODULE.ID,
			userIsGM: game.user.isGM,
			PRESETS: MODULE.setting('presets'),
			isGlobal: false,
			overrideSettings: false,
			reputationUuid: null,
			factionUuid: null,
			faction: {}
		}
	},
	updated() { },
	beforeMount() {
		// Get the current reputation and faction settings
		this.reputationUuid = this.app.options?.reputationUuid ?? null;
		this.factionUuid = this.app.options?.factionUuid ?? null;

		// Only show Global Config if Both Reputation and Faction are null
		if (this.reputationUuid != null && this.factionUuid == null) this.PRESETS = this.PRESETS.filter(preset => preset.key != 'globalDefaults');

		// Set isGlobal to true if reputationUuid is null
		this.isGlobal = this.reputationUuid == null;

		// Set Faction Settings
		let settings = MODULE.setting('storage');
		if (this.factionUuid) settings = settings.find(rep => rep.uuid == this.reputationUuid)?.factions?.find(faction => faction.uuid == this.factionUuid)?.settings ?? { preset: 'inherit' };
		else if (this.reputationUuid) settings = settings.find(rep => rep.uuid == this.reputationUuid)?.settings ?? { preset: 'inherit' };
		else settings = null;

		this.faction = this.getSettings(settings ?? { preset: 'globalDefaults' });
		
		// Set Override Settings
		this.overrideSettings = this.faction.preset == 'custom';
	},
	mounted() { },
	methods: {
		getSettings(setting) {
			// Get Presets
			const isInherit = setting.preset == 'inherit';
			let presets = MODULE.setting('presets');

			// Get Settings from Parent
			if (setting?.preset == 'inherit') {
				let storage = MODULE.setting('storage');
				if (this.factionUuid) setting = storage.find(rep => rep.factions.find(faction => faction.uuid == this.factionUuid))?.settings ?? setting;
				else if (this.reputationUuid) setting = storage.find(rep => rep.uuid == this.reputationUuid)?.settings ?? setting;
			}

			// What to search for and the settings to use
			let searchFor = ((setting?.preset ?? 'globalDefaults') == 'inherit' ? 'globalDefaults' : (setting?.preset ?? 'globalDefaults'));
			let settings = mergeObject(presets.find(preset => preset.key === searchFor)?.settings ?? {}, setting ?? {}, { inplace: false });

			// If preset is inherit, set preset to inherit
			if (isInherit) settings.preset = 'inherit';

			// if value is not set, set it to default
			if (!settings?.value) settings.value = settings.default;
			
			// Check if settings 
			return settings;
		},
		getConditions() {
			// Sort Tiers from Lowers to Heighest
			const sortTiers = (tiers) => tiers.sort((a, b) => a[0] - b[0]);
	
			// Get Conditions - Then Sort Tiers from Lowest to Heights
			let conditions = this.getSettings(this.faction);
			conditions.tiers = sortTiers(conditions.tiers);
	
			// Correct min and max values
			if (conditions.min > conditions.tiers[0][0]) conditions.min = conditions.tiers[0][0];
			if (conditions.max < conditions.tiers[conditions.tiers.length - 1][0]) conditions.max = conditions.tiers[conditions.tiers.length - 1][0];
			
			// Return Conditions
			return conditions;
		},
		getStyle() {
			// Get Conditions from Global => Reputation => Faction
			let conditions = this.getConditions();

			// If colorize is set to false, exit with blank
			if (!conditions.colorize) return { };
	
			const getPercentage = (value, min, max) => ((value - min) * 100) / (max - min);
			const getColor = (value) => ["hsl(", 100 - ((1 - value) * 120).toString(10), ",100%,50%)"].join("");

			return {
				'--color-text-hyperlink': getColor(getPercentage(this.faction.value, conditions.min, conditions.max) / 100)
			};
		},
		getLabel() {
			// Get Conditions from Global => Reputation => Faction
			let conditions = this.getConditions();

			// Get Label based on Reputation Value
			let label = conditions.tiers.find(searchLabel =>  this.faction.value <= searchLabel[0]);

			// Return label or Unknown
			return label?.[1] ?? game.i18n.localize('Unknown');
		},
		// Event Listeners
		onChangeReputation(event) {
			event.preventDefault();
			if (event.target.closest('button')?.dataset?.action === 'increase') this.faction.value++;
			else if (event.target.closest('button')?.dataset?.action === 'decrease') this.faction.value--;
		},
		onChangePreset(event) {
			let value = { preset: event.target.value };

			if (value.preset === 'custom') return;
			else if (value.preset === 'inherit') {
				if (this.factionUuid == null) value.preset = 'globalDefaults';
				// Get Reputation Settings where Faction is in reputation
				//else value.preset = MODULE.setting('storage').find(rep => (rep.find(faction => faction.uuid == this.factionUuid)))?.settings?.preset ?? 'globalDefaults'; 
				else value.preset = 'inherit'; // MODULE.setting('storage').find(rep => rep.factions.find(faction => faction.uuid == this.factionUuid))?.settings?.preset ?? 'globalDefaults';
			}

			let settings = this.getSettings(value);
			this.faction = mergeObject(settings, { value: settings.default }, {inplace: false});

			setTimeout(() => { ui.activeWindow.setPosition({ height: 'auto' }) }, 1);
		},
		onChangeOverrideSettings(event) {
			// If Override Settings is true, exit
			if (event.target.checked) return;

			// Get Selected Preset or set to inherit
			let preset = event.target.closest('section').querySelector('select').value;
			if (preset === 'custom') preset = 'inherit';

			// Set Faction Settings
			this.faction = this.getSettings({ preset: preset });
		},
		onChangeColorize(event) {
			this.faction.colorize = event.target.checked;
		},
		onAddTier(event) {
			event.preventDefault();
			// Sort Tiers from Lowers to Heighest
			const sortTiers = (tiers) => tiers.sort((a, b) => a[0] - b[0]);

			// Get Tier
			const elem = event.target.closest('li');

			// Check if Tier Condition is set
			if ((elem.querySelector('input[type="number"]').value) == '') return (elem.querySelector('input[type="number"]').focus());
			if (elem.querySelector('input[type="text"]').value.trim().length == 0) return (elem.querySelector('input[type="text"]').focus());

			// Add Tier
			this.faction.tiers.push([
				parseInt(elem.querySelector('input[type="number"]').value),
				elem.querySelector('input[type="text"]').value.trim()
			]);

			// Clear inputs
			elem.querySelector('input[type="number"]').value = this.faction?.value ?? this.faction?.default ?? 0;
			elem.querySelector('input[type="text"]').value = '';

			// Refocus on Value
			elem.querySelector('input[type="number"]').focus();

			// Sort Tiers from Lowest to Heighest
			this.faction.tiers = sortTiers(this.faction.tiers);

			// Update Configuration App Size
			setTimeout(() => { ui.activeWindow.setPosition({ height: 'auto' }) }, 1);
		},
		onUpdateTier(event) {
			// Sort Tiers from Lowers to Heighest
			const sortTiers = (tiers) => tiers.sort((a, b) => a[0] - b[0]);

			// Get Tier and Value
			const target = event.target;
			const tier = target.closest('li').dataset.tier;

			// Update Tier Value
			this.faction.tiers[tier][0] = parseInt(target.value);
			this.faction.tiers = sortTiers(this.faction.tiers);
		},
		onRemoveTier(event) {
			event.preventDefault();

			// Get Tier
			const target = event.target.closest('li');

			// Remove Tier
			this.faction.tiers.splice(parseInt(target.dataset.tier), 1);

			// Update Configuration App Size
			setTimeout(() => { ui.activeWindow.setPosition({ height: 'auto' }) }, 1);
		},
		async onSubmit(event) {
			if (this.isGlobal) {
				// If no Tiers are set, exit
				if (this.faction.tiers.length == 0) return (ui.notifications.error(game.i18n.localize('configure.notifications.error.noTiers')));

				// Get Element and Preset
				const storage = MODULE.setting('storage');
				const elem = event.target.closest('form');
				const presetKey = elem.querySelector('select').value;
				let preset = {
					key: presetKey,
					name: elem.querySelector('select').selectedOptions[0].innerText,
					settings: this.faction
				};

				// Clean up settings
				delete this.faction.value;
				delete this.faction.preset;

				// If Preset not globalDefaults and user is holding shift, ask to overwrite globalDefaults
				if (presetKey !== 'globalDefaults' && event.shiftKey) {
					// Ask to Overwrite
					const overwrite = await VueDialog.Confirm(`<h1>${MODULE.localize('configure.dialog.overwriteGlobalDefaults.title')}</h1>
					<p>${MODULE.localize('configure.dialog.overwriteGlobalDefaults.content')}</p>`);
					
					// If overwrite is cancled, exit and let user know preset was not updated
					if (overwrite == 'cancel') return (ui.notifications.warn(MODULE.localize('configure.notifications.warn.overwriteGlobalDefaultsRejected', { title: MODULE.TITLE })));

					// Update presetKey to globalDefaults
					preset.key = 'globalDefaults';
					preset.name = MODULE.localize(`TIERS.globalDefaults.title`)
				}
				// If Preset is custom, Create New Preset
				else if (presetKey === 'custom') {
					const getPresetKey = (name) => name.trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase();

					// Show Prompt for Preset Title
					const PresetTitle = await VueDialog.Prompt(MODULE.localize('configure.dialog.title'), {
						label: MODULE.localize('configure.dialog.custom.label'),
						type: String,
						value: "",
						hint: MODULE.localize('configure.dialog.custom.hint'),
					}, (elem, event, session) => {
						MODULE.log(elem, event, session);
						// Trim Value
						let value = elem.querySelector('input').value.trim();

						// Show Error, Focus on Input, and Exit
						const showError = (message, data) => {
							ui.notifications.error(MODULE.localize(message, data));
							elem.querySelector('input').focus();
							return false;
						}

						// Make Sure Preset Title is Set
						if (value.length == 0) return showError('configure.notifications.error.noPresetTitle', { title: MODULE.TITLE });

						// Make Sure Preset Title is Unique
						if (MODULE.setting('presets').find(preset => preset.key.toLowerCase() == getPresetKey(value.toLowerCase()))) return showError('configure.notifications.error.presetTitleExists', { title: MODULE.TITLE, preset: value });

						// If Preset Title is a Protected Keyword, Exit
						if (['globaldefaults', 'global-defaults', 'custom', 'cancel'].includes(value.toLowerCase())) return showError('configure.notifications.error.presetTitleProtected', { title: MODULE.TITLE, preset: value });

						// Return value
						return value.trim();
					});

					// If Preset Title is not set, exit
					if (PresetTitle.trim().length == 0) return (ui.notifications.error(MODULE.localize('configure.notifications.error.noPresetTitle', { title: MODULE.TITLE })));
					if (presetTitle.trim().toLowerCase() == 'cancel') return;

					// Update Preset to use New Preset Title and Key
					preset = {
						key: getPresetKey(PresetTitle.trim()),
						name: PresetTitle.trim(),
						settings: this.faction
					};
				
				}
				// Check if Preset is in Use or is Global
				else if (presetKey !== 'custom') {
					// Check if Preset is in Use or is Global Defaults
					const isPresetInUse = storage.find(rep => ((rep?.settings?.preset ?? '') == presetKey || rep?.factions.find(fac => (fac?.settings?.preset ?? '') == presetKey)));
					if (isPresetInUse || presetKey == 'globalDefaults') {
						// Ask to Overwrite
						const overwrite = await VueDialog.Confirm(`<h1>${MODULE.localize('configure.dialog.updatePreset.title', { title: preset.name })}</h1>
						<p>${MODULE.localize('configure.dialog.updatePreset.content', { title: preset.name })}</p>`);
						
						// If overwrite is cancled, exit and let user know preset was not updated
						if (overwrite == 'cancel') return (ui.notifications.warn(MODULE.localize('configure.notifications.warn.overwriteRejected', { title: MODULE.TITLE, preset: preset.name })));
					}
				}

				// Update Presets
				let PRESETS = MODULE.setting('presets');
				// If Preset Exists, Update it
				if (PRESETS.find(p => p.key == preset.key)) PRESETS[PRESETS.findIndex(p => p.key == preset.key)] = preset;
				// Otherwise, Add it
				else PRESETS.push(preset);

				// Save Presets
				MODULE.setting('presets', PRESETS);

				// Check if Window is open
				const ManagerWindow = Object.entries(ui.windows).find(w => w[1].id == `${MODULE.ID}-manager`)?.[1];
				if (ManagerWindow) {
					MODULE.log('Manager Window is Open', ManagerWindow);
				}

				// Close Configuration App
				this.app.close();

			} else if (this.reputationUuid || this.factionUuid) {
				// Get Storage and what to modify
				const storage = Object.entries(ui.windows).find(w => w[1].id == `${MODULE.ID}-manager`)?.[1]?.vue?.session?.reputations ?? MODULE.setting('storage');
				let modifyStorage = storage.find(rep => rep.uuid == this.reputationUuid);
				if (this.factionUuid) modifyStorage = modifyStorage?.factions?.find(faction => faction.uuid == this.factionUuid);

				// If Override is false, set preset to selected
				if (!this.overrideSettings) this.faction = { preset: this.faction.preset };
				// If Override is true, set preset to custom
				else if (this.overrideSettings) this.faction.preset = 'custom';

				// Remove Value as its only used for the Preview
				delete this.faction.value;

				// Set Storage Settings
				modifyStorage.settings = this.faction;

				// If preset is inherit, remove settings
				if (this.faction.preset == 'inherit') delete modifyStorage.settings;
				
				// Save Storage
				MODULE.setting('storage', storage);

				// Close App
				this.app.close();
			}
		}
	},
	template: `./modules/${MODULE.ID}/templates/configure.vue`
}