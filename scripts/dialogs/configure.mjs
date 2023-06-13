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

	static getConditions(faction) {
		// Sort Tiers from Lowers to Heighest
		const sortTiers = (tiers) => tiers.sort((a, b) => a[0] - b[0]);

		// Get Conditions from Global => Reputation => Faction
		// Then Sort Tiers from Lowest to Heights
		let conditions = faction;
		conditions.tiers = sortTiers(faction.tiers);

		// Correct min and max values
		//if (conditions.min > conditions.tiers[0][0]) conditions.min = conditions.tiers[0][0];
		//if (conditions.max < conditions.tiers[conditions.tiers.length - 1][0]) conditions.max = conditions.tiers[conditions.tiers.length - 1][0];

		return conditions;
	}

	async getData() {
		// Get Settings Defaults
		let defaults = MODULE.setting('globalDefaults');
		let hasSettings = false;
		
		// If Reputation is set, get reputation defaults and merge with global defaults
		if ((this?.object?.reputationUuid ?? false)) {
			let settings = MODULE.setting('storage').find(rep => rep.uuid === this.object.reputationUuid)?.settings ?? {};
			defaults = mergeObject(defaults, settings, {inplace: false});
			// If Faction is set, get faction defaults and merge with global defaults
			if ((this?.object?.factionUuid ?? false)) {
				settings = MODULE.setting('storage').find(rep => rep.uuid === this.object.reputationUuid)?.factions.find(fac => fac.uuid === this.object.factionUuid)?.settings ?? {};
				defaults = mergeObject(defaults, settings, {inplace: false});
			}
			
			// Check if Reputation or Faction has Settings
			hasSettings = Object.keys(settings)?.length ?? 0 > 0;
		}


		return {
			ID: MODULE.ID,
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

				// If there Are No Tiers, don't save Config as its invalid
				if (this._vue.store.faction.tiers?.length <= 0) return; 

				// Remove Value from Faction
				delete faction.value;

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

				// Check if setting Global Configuration
				if (this._vue.store.isGlobal) MODULE.setting('globalDefaults', faction);
				// If Both Reputation and Faction are set, save Faction Configuration
				else if ((this?.object?.reputationUuid ?? false) && (this?.object?.factionUuid ?? false)) {
					let settings = MODULE.setting('storage');
					let rep = settings.find(rep => rep.uuid === this.object.reputationUuid);
					let fac = rep.factions.find(fac => fac.uuid === this.object.factionUuid);

					// If Overwrite is set, save Faction Configuration
					if (this._vue.store.showSettings) fac.settings = faction;
					// Otherwise, delete Faction Configuration
					else delete fac.settings;

					// Save Settings
					MODULE.debug(settings);
					MODULE.setting('storage', settings);
				// If only Reputation is set, save Reputation Configuration
				}else if (this?.object?.reputationUuid ?? false) {
					let settings = MODULE.setting('storage');
					let rep = settings.find(rep => rep.uuid === this.object.reputationUuid);

					// If Overwrite is set, save Reputation Configuration
					if (this._vue.store.showSettings) rep.settings = faction;
					// Otherwise, delete Reputation Configuration
					else delete rep.settings;
					
					// Save Settings
					MODULE.debug(settings);
					MODULE.setting('storage', settings);
				}

				this.close();
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