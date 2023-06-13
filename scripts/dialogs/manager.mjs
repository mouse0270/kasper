// GET REQUIRED LIBRARIES
import { VueApplication } from '../lib/fvtt-petite-vue.mjs';

// GET MODULE CORE
import { MODULE } from '../_module.mjs';

// IMPORT DIALOGS
import { Configure } from './configure.mjs';

export class Manager extends VueApplication {
	constructor(options) {
		super(options);
	}

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: `${MODULE.TITLE} | ${MODULE.localize('manager.title')}`,
			id: `${MODULE.ID}-manager`,
			classes: MODULE.setting('minify') ? ['minify'] : [],
			template: `./modules/${MODULE.ID}/templates/manager.vue`,
			resizable: false,
			width: window.innerWidth > 315 ? 315 : window.innerWidth - 100,
			height: "auto", //window.innerHeight > 100 ? 100 : window.innerHeight - 100,
			// Not Sure Why this needs to exist, just found it on google
			dragDrop: [{ dropSelector: null }]
		});
	}

	getSettings(reputation, faction) {
		return mergeObject(MODULE.setting('globalDefaults'), mergeObject(reputation?.settings ?? {}, faction?.settings ?? {}, { inplace: false }), { inplace: false });
	}

	getConditions(reputation, faction) {
		// Sort Tiers from Lowers to Heighest
		const sortTiers = (tiers) => tiers.sort((a, b) => a[0] - b[0]);

		// Get Conditions from Global => Reputation => Faction
		// Then Sort Tiers from Lowest to Heights
		let conditions = this.getSettings(reputation, faction);
		conditions.tiers = sortTiers(conditions.tiers);

		// Correct min and max values
		if (conditions.min > conditions.tiers[0][0]) conditions.min = conditions.tiers[0][0];
		if (conditions.max < conditions.tiers[conditions.tiers.length - 1][0]) conditions.max = conditions.tiers[conditions.tiers.length - 1][0];

		return conditions;
	}

	async getData() {
		const reputations = await MODULE.setting('storage');
		return {
			MODULE: MODULE,
			ID: MODULE.ID,
			reputations: reputations.length > 0 ? reputations : [],
			getLabel: (reputation, faction) => {
				// Get Conditions from Global => Reputation => Faction
				let conditions = this.getConditions(reputation, faction);

				// Get Label based on Reputation Value
				let label = conditions.tiers.find(searchLabel =>  faction.reputation <= searchLabel[0]);

				return label?.[1] ?? game.i18n.translations.Unknown;
			},
			getStyle: (reputation, faction, elem) => {
				// Get Conditions from Global => Reputation => Faction
				let conditions = this.getConditions(reputation, faction);

				// If colorize is set to false, exit with blank
				if (!conditions.colorize) return { };
		
				const getPercentage = (value, min, max) => ((value - min) * 100) / (max - min);
				const getColor = (value) => ["hsl(", 100 - ((1 - value) * 120).toString(10), ",100%,50%)"].join("");

				return {
					'--color-text-hyperlink': getColor(getPercentage(faction.reputation, conditions.min, conditions.max) / 100)
				};
			},
			getSettings: (reputation, faction) => this.getSettings(reputation, faction),
			addReputation: () => {
				this._vue.store.reputations.push({
					"uuid": `${MODULE.ID}.${randomID()}`,	
					"name": MODULE.localize('reputation.title'),
					"factions": []	
				});

				setTimeout(() => {
					this.setPosition({ height: 'auto' });
				}, 1);
			},
			onRepuationNameChange: this._onRepuationNameChange,
			onReputationChange: this._onReputationChange,
			onFactionNameChange: this._onFactionNameChange,
			addFaction: this._addFaction,
		};	
	}

	async _onRepuationNameChange(reputation, event, store) {
		// If name does not exist, exit
		if (!(store.reputations.find(rep => rep.uuid == reputation.uuid)?.name ?? false)) return;

		// Update Storage
		store.reputations.find(rep => rep.uuid == reputation.uuid).name = event.target.innerText;
		
		// Save to Storage
		MODULE.setting('storage', store.reputations);
	};

	async _onReputationChange(settings, faction, type, store) {
		let conditions = mergeObject(settings, faction?.settings ?? {}, { inplace: false });

		if (type == 'increase' && faction.reputation < conditions.max) faction.reputation++;
		else if (type == 'decrease' && faction.reputation > conditions.min) faction.reputation--;
		else if (type?.target?.value ?? false) faction.reputation = type?.target?.value;


		// Save to Storage
		MODULE.setting('storage', store.reputations);
	}

	async _addFaction(reputation, store) {
		// Add Faction to Reputation Tracker
		store.reputations.find(rep => rep.uuid == reputation.uuid).factions.push({
			"uuid": `${MODULE.ID}.${randomID()}`,
			"name": MODULE.localize('reputation.faction.title'),
			"reputation": 0
		});

		// Save to Storage
		MODULE.setting('storage', store.reputations);

		// Update UI
		setTimeout(() => {
			ui.activeWindow.setPosition({height: 'auto'})
		}, 1);
	}

	async _onFactionNameChange(reputation, faction, event, store) {
		// Check if name can be changed
		if (!store.reputations.find(rep => rep.uuid == reputation.uuid)?.factions.find(fac => fac.uuid == faction.uuid)?.uuid.startsWith(`${MODULE.ID}.`)) return;

		// If name does not exist, exit
		if (!(store.reputations.find(rep => rep.uuid == reputation.uuid)?.factions.find(fac => fac.uuid == faction.uuid)?.name ?? false)) return;

		// Update Storage
		store.reputations.find(rep => rep.uuid == reputation.uuid).factions.find(fac => fac.uuid == faction.uuid).name = event.target.innerText;

		// Save to Storage
		MODULE.setting('storage', store.reputations);
	}

	async _onDrop(event) {
        const { target } = event;
        const data = TextEditor.getDragEventData(event);
		const { type, uuid } = data;
		const supportedTypes = ["Folder", "Actor", "JournalEntry"];
		const restrictTypes = true;

		// Check if type is supported and enforce restriction is set to true
        if (!supportedTypes.includes(type) && restrictTypes) return;

		// Get Document from UUID
		const document = await fromUuid(uuid);

		// If Folder does not Container Support Types, Exit
		if (type == 'Folder' && !supportedTypes.includes(document.type)) return;

		let targetSection = null;
		// TODO: Make this Cleaner
		// If type is folder, or there are no reputations, or the target is not in the reputation container, add a new reputation
		if (type == 'Folder' || this._vue.store.reputations.length == 0 || target.closest(`section.${MODULE.ID}-faction-container`) == null) {
			// Create new Reputation
			this._vue.store.reputations.push({
				"uuid": `${MODULE.ID}.${randomID()}`,
				"name": document?.folder?.name ?? `${MODULE.localize('reputation.title')} ${this._vue.store.reputations.length + 1}`,
				"factions": []
			});

			// Set Target Section
			targetSection = this._vue.store.reputations[this._vue.store.reputations.length - 1];

		// If the target is the reputation container, add a new faction
		}else{
			// Set Target Section
			targetSection = this._vue.store.reputations.find(rep => rep.uuid == target.closest(`section.${MODULE.ID}-faction-container`)?.id);	
		}

		// Add Actor to Reputation Tracker
		if (type == "Folder") {
			// Update Reputation Document UUID and Name based on Folder
			targetSection.docUuid = document?.uuid ?? `${MODULE.ID}.${randomID()}`;
			targetSection.name = document?.name ?? game.i18n.localize('FOLDER.Name');
			
			// Loop through doucments and add them to the faction
			targetSection.factions = (document?.contents ?? document.content)?.map(doc => {
				return {
					"uuid": `${MODULE.ID}.${randomID()}`,
					"docUuid": doc.uuid,
					"name": doc.name,
					"reputation": 0
				}
			});
		}else {
			// Add Document to Faction
			targetSection.factions.push({
				"uuid": `${MODULE.ID}.${randomID()}`,
				"docUuid": uuid,
				"name": document?.name ?? MODULE.localize('reputation.faction.title'),
				"reputation": 0
			});
		}

		setTimeout(() => {	
			MODULE.setting('storage', this._vue.store.reputations);
			this.setPosition({ height: 'auto' });
		}, 1);
    }
	
	activateListeners(html) {
		super.activateListeners(html);
		const elem = html[0];

		let dragOverTimer = null;
		const dragDrop = (status) => {
			// Reset Timer
			dragOverTimer = clearTimeout(dragOverTimer);

			// Add Timer to Prevent Flasing on Drag as class appears to get removed constantly as you move over elements
			dragOverTimer = setTimeout(() => {
				// Update Action Button Text
				elem.classList.toggle('dragover', status);
				elem.querySelector('div.action-buttons > button').innerHTML = status ? MODULE.localize('manager.dragDrop.dropHere') : `<i class="fa-regular fa-circle-plus"></i> ${MODULE.localize('manager.dragDrop.addReputation')}`;
			// If Status is True, Set Timer to 1ms, Otherwise Set Timer to 100ms
			}, status ? 1 : 100);
		}
		// Add Drag Events
		elem.addEventListener('dragover', ev => dragDrop(true));
		elem.addEventListener('drop', ev => dragDrop(false));
		elem.addEventListener('dragleave', ev => dragDrop(false));

		// Add Context Options for Section Headers
		new ContextMenu(html, 'h1[contenteditable]', [{
			name: game.i18n.localize('Configure'),
			icon: '<i class="fa-regular fa-sliders"></i>',
			condition: game.user.isGM,
			callback: (elems => {
				const elem = elems[0];
				// Get Reputation UUID
				const reputation = elem.closest('section').id;

				// Open Configure Dialog
				new Configure({ reputationUuid: reputation, factionUuid: null}).render(true);
			})
		},{
			name: game.i18n.localize('Delete'),
			icon: '<i class="fa-regular fa-trash-can-xmark"></i>',
			condition: game.user.isGM,
			callback: (elems => {
				const elem = elems[0];
				// Get Reputation UUID
				const reputation = elem.closest('section').id;

				// Remove Reputation from Storage
				this._vue.store.reputations = this._vue.store.reputations.filter(rep => rep.uuid != reputation);

				// Save to Storage
				MODULE.setting('storage', this._vue.store.reputations);

				// Update UI
				setTimeout(() => {
					this.setPosition({ height: 'auto' });
				}, 1);
			})
		}]);

		// Add Context Options for Factions
		new ContextMenu(html, 'ul li div.form-group', [{
			name: game.i18n.localize('Configure'),
			icon: '<i class="fa-regular fa-sliders"></i>',
			condition: game.user.isGM,
			callback: (elems => {
				const elem = elems[0];
				// Get Reputation UUID
				const reputation = elem.closest('section').id;
				const faction = elem.closest('li').id;

				// Open Configure Dialog
				new Configure({ reputationUuid: reputation, factionUuid: faction }).render(true);
			})
		},{
			name: game.i18n.localize('Delete'),
			icon: '<i class="fa-regular fa-trash-can-xmark"></i>',
			condition: game.user.isGM,
			callback: (elems => {
				const elem = elems[0];
				// Get Reputation and Faction UUID
				const reputation = elem.closest('section').id;
				const faction = elem.closest('li').id;

				// Remove Faction from Reputation
				this._vue.store.reputations.find(rep => rep.uuid == reputation).factions = this._vue.store.reputations.find(rep => rep.uuid == reputation).factions.filter(fac => fac.uuid != faction);
				
				// Save Reputations
				MODULE.setting('storage', this._vue.store.reputations);

				// Update UI
				setTimeout(() => { this.setPosition({ height: 'auto' }); }, 1);
			})
		}]);

		// If Method is Pinned, Add Window Journal Sidebar
		if (MODULE.setting('trigger') == 'pinned' && document.querySelector('#sidebar #journal')) {
			document.querySelector('#sidebar #journal > header').insertAdjacentElement('beforeend', document.querySelector(`#${MODULE.ID}-manager`));
		}

        //this.render();
        this.setPosition({ height: 'auto' });
	}
}