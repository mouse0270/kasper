// GET REQUIRED LIBRARIES
import { VueFormApplication } from '../lib/fvtt-petite-vue.mjs';

// GET MODULE CORE
import { MODULE } from '../_module.mjs';

export class Configure extends VueFormApplication {
	constructor(options) {
		super(options);
	}

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: `${MODULE.TITLE} | ${MODULE.localize('configure.title')}`,
			id: `${MODULE.ID}-configure`,
			classes: [],
			template: `./modules/${MODULE.ID}/templates/configure.vue`,
			resizable: false,
			width: window.innerWidth > 450 ? 450 : window.innerWidth - 100,
			height: "auto",
		});
	}

	static getSettings(setting) {
		let presets = MODULE.setting('presets');
		let settings = mergeObject(presets.find(preset => preset.key === setting?.preset ?? 'globalDefaults')?.settings ?? {}, setting ?? {}, { inplace: false });

		return settings;
	}

	static getConditions(faction) {
		// Sort Tiers from Lowers to Heighest
		const sortTiers = (tiers) => tiers.sort((a, b) => a[0] - b[0]);

		// If faction does not have a preset or tiers, assume it is global
		if (!(faction?.preset ?? false) && !(faction?.tiers ?? false)) faction = null;

		// Get Settings
		let settings = Configure.getSettings(faction);

		// Get Conditions from Global => Reputation => Faction
		// Then Sort Tiers from Lowest to Heights
		settings.tiers = sortTiers(settings?.tiers ?? []);

		return settings;
	}

	async getData() {
		// Get Settings Defaults
		let defaults = Configure.getSettings({ preset: 'globalDefaults' });
		let hasSettings = false;
		
		// If Reputation is set, get reputation defaults and merge with global defaults
		if ((this?.object?.reputationUuid ?? false)) {
			let settings = MODULE.setting('storage').find(rep => rep.uuid === this.object.reputationUuid)?.settings ?? {};
			MODULE.log('Reputation Settings', settings);
			if (!isEmpty(settings)) defaults = Configure.getSettings(settings);

			// If Faction is set, get faction defaults and merge with global defaults
			if ((this?.object?.factionUuid ?? false)) {
				settings = MODULE.setting('storage').find(rep => rep.uuid === this.object.reputationUuid)?.factions.find(fac => fac.uuid === this.object.factionUuid)?.settings ?? {};
				MODULE.log('Faction Settings', settings);
				if (!isEmpty(settings)) defaults = Configure.getSettings(settings);
			}
			
			// Check if Reputation or Faction has Settings
			hasSettings = (settings ?? {}).hasOwnProperty('tiers') ?? false;
		}


		return {
			ID: MODULE.ID,
			PRESETS: MODULE.setting('presets'),
			title: () => {
				if (this.object.reputationUuid && this.object.factionUuid) {
					let title = MODULE.setting('storage').find(rep => rep.uuid === this.object.reputationUuid).factions.find(fac => fac.uuid === this.object.factionUuid).name;
					return MODULE.localize('configure.titles.faction', { title: title });
				} else if (this.object.reputationUuid) {
					let title = MODULE.setting('storage').find(rep => rep.uuid === this.object.reputationUuid).name;
					return MODULE.localize('configure.titles.reputation', { title: title });
				} else return MODULE.localize('configure.titles.global');
			},
			isGlobal: !(this?.object?.reputationUuid ?? false),
			showSettings: hasSettings,
			faction: mergeObject(defaults, { value: defaults.default }, {inplace: false}),
			getLabel: (faction) => {
				// Get Conditions
				let conditions = Configure.getConditions(faction);

				// Get Label based on Value
				let label = conditions.tiers.find(searchLabel =>  faction.value <= searchLabel[0]);

				return label?.[1] ?? game.i18n.translations.Unknown;
			},
			getStyle: (faction, elem) => {
				if (!faction.colorize) return {};

				// Get Conditions from Global => Reputation => Faction
				let conditions = Configure.getConditions(faction);
		
				const getPercentage = (value, min, max) => ((value - min) * 100) / (max - min);
				const getColor = (value) => ["hsl(", 100 - ((1 - value) * 120).toString(10), ",100%,50%)"].join("");

				return {
					'--color-text-hyperlink': getColor(getPercentage(faction.value, conditions.min, conditions.max) / 100)
				};
			},
			showSettingsToggle: (event, store) => { 
				store.showSettings = event.target.checked;
				setTimeout(() => { ui.activeWindow.setPosition({ height: 'auto' }) }, 1);
			},
			onChangePreset: (event) => {
				if (event.target.value === 'custom') return;
				let settings = Configure.getSettings({ preset: event.target.value });
				this._vue.store.faction = mergeObject(settings, { value: settings.default }, {inplace: false});
				setTimeout(() => {
					ui.activeWindow.setPosition({ height: 'auto' }) 
				}, 1);
			},
			updateColorize: (faction, event) => { faction.colorize = event.target.checked; },
			onReputationChange: this._onReputationChange,
			onUpdateTier: ($event, faction, factionIdx) => {
				faction.tiers[factionIdx] = [
					parseInt($event.target.value),
					faction.tiers[factionIdx][1]
				];
			},
			onRemoveTier: (event, faction, factionIdx) => { 
				event.preventDefault();
				const elem = event.target.closest('li');

				// remove tier from faction by index
				faction.tiers.splice(factionIdx, 1);

				setTimeout(() => { ui.activeWindow.setPosition({ height: 'auto' }) }, 1);
			},
			onAddTier: (event, faction) => {
				event.preventDefault();
				const elem = event.target.closest('li');
				const inputRep = elem.querySelector('input[type="number"]');
				const inputLabel = elem.querySelector('input[type="text"]');

				if (!inputRep || !inputLabel) return;

				faction.tiers.push([parseInt(inputRep.value), inputLabel.value]);
				faction = Configure.getConditions(faction);

				inputRep.value = faction.default;
				inputLabel.value = '';

				setTimeout(() => { ui.activeWindow.setPosition({ height: 'auto' }) }, 1);
			},
			SaveConfig: async (event, faction) => {
				event.preventDefault();

				// Get App Element
				const elem = event.target.closest('form');
				const preset = elem.querySelector('.form-fields select').value;

				// If there Are No Tiers, don't save Config as its invalid
				if (this._vue.store.faction.tiers?.length <= 0) return; 

				// Remove Value from Faction
				delete faction.value;
				delete faction.preset;

				// Wait For Setting To Update
				// TODO: Move to Module.mjs and just always update ui when setting is updated
				let hookId = Hooks.on('updateSetting', (setting, value, options, userId) => {
					if ([`${MODULE.ID}.globalDefaults`, `${MODULE.ID}.storage`].includes(setting.key)) {
						Hooks.off('updateSetting', hookId); hookId = undefined;

						// If Manager Window is Open, Refresh it
						if (Object.entries(ui.windows).find(w => w[1].id == `${MODULE.ID}-manager`)?.[1] ?? false) {
							Object.entries(ui.windows).find(w => w[1].id == `${MODULE.ID}-manager`)?.[1]?.render(true);
						}
					}
				});

				MODULE.log('Saving Configuration', this.object, { data: faction });	

				// 
				const presets = MODULE.setting('presets');
				const isGlobal = this._vue.store.isGlobal;
				const isUnique = !isGlobal && this._vue.store.showSettings;
				const isEqual = objectsEqual(presets.find(p => p.key === preset)?.settings ?? {}, faction);
				const promptUser = isUnique && preset === 'custom' || preset !== 'globalDefaults';
				const configDialog = this;

				MODULE.debug({ isGlobal, preset, isUnique, isEqual, presets, faction });

				// If isGlobal and isEqual is false then Save Global Defaults
				if (isGlobal && preset !== 'custom' && !isEqual) {
					const isPresetUsed = () => {
						let isUsed = false;
						// Check if any reputation is using this preset
						if (MODULE.setting('storage').find(rep => rep?.settings?.preset ?? '' === preset)) isUsed = true;
						// Check if any faction in any reputation is using this preset
						if (!isUsed && MODULE.setting('storage').find(rep => rep?.factions?.find(f => f?.settings?.preset ?? '' === preset))) isUsed = true;

						return isUsed;
					}

					if (preset === 'globalDefaults' || isPresetUsed()) {
						Dialog.confirm({
							title: game.i18n.format(`${MODULE.ID}.configure.dialog.updatePreset.title`, {title: elem.querySelector('.form-fields select').selectedOptions[0].text }),
							content: `<p>${game.i18n.format(`${MODULE.ID}.configure.dialog.updatePreset.content`, {title: elem.querySelector('.form-fields select').selectedOptions[0].text })}</p>`,
							yes: async () => {
								// Update Global Defaults with Settings
								presets.find(p => p.key === preset).settings = faction

								// Save Global Defaults
								MODULE.setting('presets', presets);

								// Close Configure Dialog
								configDialog.close();
							}
						})
					}else{
						// Update Global Defaults with Settings
						presets.find(p => p.key === preset).settings = faction

						// Save Global Defaults
						MODULE.setting('presets', presets);

						// Close Configure Dialog
						configDialog.close();
					}
				}
				// If isGlobal and Preset == 'custom'
				else if (isGlobal && preset === 'custom') {
					new Dialog({
						title: game.i18n.localize(`${MODULE.ID}.configure.dialog.custom.title`),
						content: `<p>${game.i18n.localize(`${MODULE.ID}.configure.dialog.custom.content`)}</p>
						<div class="form-group" style="margin-bottom: 1rem;">
							<label>${game.i18n.localize(`${MODULE.ID}.configure.dialog.custom.label`)}</label>
							<input type="text" placeholder="${game.i18n.localize(`${MODULE.ID}.configure.dialog.custom.label`)}" />
						</div>`,
						render: html => {
							// Get Elements
							const dialog = html[0].closest('.window-content');
							const input = dialog.querySelector('input[type="text"]');
							const buttonYes = dialog.querySelector('.dialog-buttons button.yes');

							buttonYes.disabled = true;
							input.focus();

							input.addEventListener('input', event => { buttonYes.disabled = !event.target.value.length > 0; })
						},
						buttons: {
							yes: {
								icon: '<i class="fas fa-check"></i>',
								label: game.i18n.localize(`${MODULE.ID}.configure.dialog.custom.buttons.yes`),
								callback: (html) => {
									const presetName = html[0].querySelector('input[type="text"]').value;
									const presetKey = presetName.replace(/[^\w\s-]/g, '') .replace(/\s+/g, '-').trim().toLowerCase();   
									// If user didn't enter a name, don't save
									if (presetName.length <= 0) return ui.notifications.error(`<strong>${MODULE.TITLE}:</strong> ${game.i18n.localize(`${MODULE.ID}.configure.dialog.custom.notifications.error`)}`);

									// If Preset Name Already Exists
									if (presets.find(p => p.key.toLowerCase() === presetKey)) return ui.notifications.error(`<strong>${MODULE.TITLE}:</strong> ${game.i18n.format(`${MODULE.ID}.configure.dialog.custom.notifications.exists`, { name: presetName })}`);
									
									presets.push({ key: presetKey, name: presetName, settings: faction });

									// Save to Presets and Close Configuration Dialog
									MODULE.setting('presets', presets);
									configDialog.close();
								}
							},
							no: {
								icon: '<i class="fas fa-times"></i>',
								label: game.i18n.localize(`${MODULE.ID}.configure.dialog.custom.buttons.no`),
								callback: (html) => { }
							}
						},
						default: 'yes'
					}).render(true);
				}
				// If Updating Reputation or Faction
				if (!isGlobal) {
					const updateWindow = Object.entries(ui.windows).find(w => w[1].id == "kasper-manager")?.[1]?._vue?.store?.reputations ?? MODULE.setting('storage');

					// if Faction UUID is set, save Faction Configuration
					if (this?.object?.factionUuid ?? false) {
						let rep = updateWindow.find(rep => rep.uuid === this.object.reputationUuid);
						let fac = rep.factions.find(fac => fac.uuid === this.object.factionUuid);

						// Save Faction Preset, if Unique save settings otherwise save preset
						fac.settings = isUnique ? faction : {preset: preset};

						// Save Settings
						MODULE.debug('SAVING FACTION', updateWindow);
						MODULE.setting('storage', updateWindow);
					}
					// if only Reputation UUID is set, save Reputation Configuration
					else if (this?.object?.reputationUuid ?? false) {
						let rep = updateWindow.find(rep => rep.uuid === this.object.reputationUuid);

						// Save Reputation Preset, if Unique save settings otherwise save preset
						rep.settings = isUnique ? faction : {preset: preset};

						// Save Settings
						MODULE.debug('SAVING REPUTATION', updateWindow);
						MODULE.setting('storage', updateWindow);
					}

					// Close Configure Dialog
					configDialog.close();

					if (Object.entries(ui.windows).find(w => w[1].id == "kasper-manager")?.length > 0) {
						setTimeout(() => {
							Object.entries(ui.windows).find(w => w[1].id == "kasper-manager")?.[1]?.setPosition({ height: 'auto' }) ?? false;
						}, 1);
					}
				}
			}
		};	
	}

	async _onReputationChange(faction, event, type) {
		event.preventDefault();
		let conditions = Configure.getConditions(faction);

		if (type == 'increase' && faction.value < conditions.max) faction.value++;
		else if (type == 'decrease' && faction.value > conditions.min) faction.value--;
		else if (event?.target?.value ?? false) faction.value = event?.target?.value;
	}

	activateListeners(html) {
		super.activateListeners(html);
		const elem = html[0];
	}
}