// GET REQUIRED LIBRARIES
import { VueApplication } from '../lib/fvtt-petite-vue.mjs';
import Sortable from '../lib/sortable.core.esm.js';

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

	getSettings(reputation = null, faction = null) {
		let settings = MODULE.setting('globalDefaults'); //mergeObject(MODULE.setting('globalDefaults'), mergeObject(reputation?.settings ?? {}, faction?.settings ?? {}, { inplace: false }), { inplace: false });
		if (reputation?.settings ?? false) settings = reputation.settings;
		if (faction?.settings ?? false) settings = faction.settings;

		// Check if settings has a preset
		let presets = MODULE.setting('presets');
		if ((settings?.preset ?? false) && (settings.preset !== 'custom')) {
			if (presets.find(preset => preset.key === settings.preset)?.settings ?? false) settings = presets.find(preset => preset.key === settings.preset).settings;
		}

		// Check if settings 
		return settings;
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
				this._addReputation({
					"uuid": `${MODULE.ID}.${randomID()}`,	
					"name": MODULE.localize('reputation.title'),
					"factions": []	
				});
			},
			onContentEditableKeydown: (event, reputation, store) => {
				if (event.key == 'Enter') {
					// Stop Default Behavior and Force Blur
					event.preventDefault();
					event.target.blur();

					// Browsers sometimes don't like when you do blur and focus in the same tick
					setTimeout(() => { 
						// Refocus on Input (Places cursor at start of word)
						event.target.focus(); 

						// Move Cursor to End of Text
						const range = document.createRange(), selection = window.getSelection();
						range.selectNodeContents(event.target)
						range.collapse(false);
						selection.removeAllRanges();
						selection.addRange(range);
					}, 1);
				}
			},
			onRepuationNameChange: this._onRepuationNameChange,
			onReputationChange: this._onReputationChange,
			onFactionNameChange: this._onFactionNameChange,
			addFaction: this._addFaction,
		};	
	}

	_addReputation = async (data, target = null) => {
		MODULE.debug('Adding Reputation', data, target, this._vue.store.reputations);

		// If target is null, add to end of list
		// TODO: Determine if item should be dropped between existing factions
		if (target == null) this._vue.store.reputations.push(data);
		else this._vue.store.reputations.find(rep => rep.uuid == target).factions.push(...(data?.factions ?? []));

		setTimeout(() => { 
			// Update SortableJS
			if (target == null) {
				MODULE.log(document.querySelector(`#${MODULE.ID}-manager .window-content main div.sortablejs-reputation section:last-child ul`))
				new Sortable(document.querySelector(`#${MODULE.ID}-manager .window-content main div.sortablejs-reputation section:last-child ul`), {
					group: 'faction',
					handle: '[data-action="sortable"]', // handle's class
					// Changed sorting within list
					onEnd: (event) => {
						// Get Reputation UUIDs
						const sourceRepuation = event.from.closest('section').id;
						const targetReputation = event.to.closest('section').id;
						// Get Reputation Arrays
						const sourceReputationArray = this._vue.store.reputations.find(rep => rep.uuid == sourceRepuation).factions;
						const targetReputationArray = this._vue.store.reputations.find(rep => rep.uuid == targetReputation).factions;
	
						// Get Moved Item
						const item = sourceReputationArray.splice(event.oldIndex, 1)[0];
						// Update Reputation Array
						targetReputationArray.splice(event.newIndex, 0, item);
						// Save to Storage
						MODULE.setting('storage', this._vue.store.reputations);
					}
				});
			}

			MODULE.setting('storage', this._vue.store.reputations);
			this.setPosition({ height: 'auto' }); 
		}, 1);
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
		// Get Settings Global or for Reputation
		let settings = this.getSettings(store.reputations.find(rep => rep.uuid == reputation.uuid) ?? {});

		// Add Faction to Reputation Tracker
		store.reputations.find(rep => rep.uuid == reputation.uuid).factions.push({
			"uuid": `${MODULE.ID}.${randomID()}`,
			"name": MODULE.localize('reputation.faction.title'),
			"reputation": settings.default
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

	// TODO: Add Support for Linking Documents to Factions.
	// - This will be accomplished by holding down shift and dropping the document onto a faction.
	// - If the faction is a kasper element, it will just overwrite it with the dropped document.
	// - If the faction is already linked, prompt user for confirmation to overwrite.
	async _onDrop(event) {
		// Get Properties from Event
        const { target } = event;
        const eventData = TextEditor.getDragEventData(event);
		const { type, uuid } = eventData;
		const supportedTypes = ["Folder", "Actor", "JournalEntry"];
		const restrictTypes = true;

		// Check if type is supported and enforce restriction is set to true
        if (!supportedTypes.includes(type) && restrictTypes) return;

		// Get Document from UUID
		const document = await fromUuid(uuid);

		// If Folder does not Container Support Types, Exit
		if (type == 'Folder' && !supportedTypes.includes(document.type)) return;

		// Define Variables used for Adding Reputation
		let targetSection = target.closest(`section.${MODULE.ID}-faction-container`)?.id ?? null;
		// Get Settings Global or for Reputation
		let settings = this.getSettings(this._vue.store.reputations.find(rep => rep.uuid == targetSection) ?? {});
		// Set Default Data Structure for Reputation
		let data = {
			"uuid": `${MODULE.ID}.${randomID()}`,
			"docUuid": document?.uuid ?? `${MODULE.ID}.${randomID()}`,
			"name": document?.name ?? `${MODULE.localize('reputation.title')} ${this._vue.store.reputations.length + 1}`,
			"factions": [{
				"uuid": `${MODULE.ID}.${randomID()}`,
				"docUuid": uuid ?? `${MODULE.ID}.${randomID()}`,
				"name": document?.name ?? MODULE.localize('reputation.faction.title'),
				"reputation": settings.default
			}]
		};

		// Prevent Folders from being Linked Documents
		// ? Folders aren't containers in foundry, instead they are referenced on documents. This makes it complicated to determine when they are updated
		// - so its just easier to not allow them to be linked.
		if (type == 'Folder') delete data.docUuid;


		// If type is folder or journal entry
		if (type == 'Folder' || (type == 'JournalEntry' && targetSection == null)) {
			// Set Target Section to Reputation Container to Null to add a new reputation tracker
			targetSection = null;

			// Add Factions to Reputation Tracker from contents, content or pages
			data.factions = (document?.contents ?? document?.content ?? document?.pages ?? []).map(doc => {
				return {
					"uuid": `${MODULE.ID}.${randomID()}`,
					"docUuid": doc?.uuid ?? `${MODULE.ID}.${randomID()}`,
					"name": doc?.name ?? 'Unknown',
					"reputation": settings.default
				}
			});
		}

		MODULE.debug('DROP DATA', event, eventData, document, data, targetSection);

		// Add Reputation to Tracker
		this._addReputation(data, targetSection);
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
		new ContextMenu(html, 'header', [{
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
		new ContextMenu(html, 'ul li', [{
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

		// Move Item in Array by Index to New Index
		const moveItem = (array, from, to) => {
			// If New Index is Equal to Old Index, Return Array
			if (to == from) return array;

			// Create New Array
			const newArray = [...array];
			// Move Item to New Index
			newArray.splice(to, 0, newArray.splice(from, 1)[0]);
			// Return New Array
			return newArray;
		}

		// Enable Sortable 
		var sortableReputation = new Sortable(elem.querySelector('.sortablejs-reputation'), {
			handle: '[data-action="sortable"]', // handle's class
			// Changed sorting within list
			onEnd: (event) => {
				// Get Moved Item
				const item = this._vue.store.reputations.splice(event.oldIndex, 1)[0];
				// Update Reputation Array
				this._vue.store.reputations.splice(event.newIndex, 0, item);
				// Save to Storage
				MODULE.setting('storage', this._vue.store.reputations);
			}
		});

		// Enable Sortable 
		elem.querySelectorAll('.sortablejs-reputation ul').forEach((sortableFaction, index) => {
			new Sortable(sortableFaction, {
				group: 'faction',
				handle: '[data-action="sortable"]', // handle's class
				// Changed sorting within list
				onEnd: (event) => {
					// Get Reputation UUIDs
					const sourceRepuation = event.from.closest('section').id;
					const targetReputation = event.to.closest('section').id;
					// Get Reputation Arrays
					const sourceReputationArray = this._vue.store.reputations.find(rep => rep.uuid == sourceRepuation).factions;
					const targetReputationArray = this._vue.store.reputations.find(rep => rep.uuid == targetReputation).factions;

					// Get Moved Item
					const item = sourceReputationArray.splice(event.oldIndex, 1)[0];
					// Update Reputation Array
					targetReputationArray.splice(event.newIndex, 0, item);
					// Save to Storage
					MODULE.setting('storage', this._vue.store.reputations);
				}
			});
		});

        //this.render();
        this.setPosition({ height: 'auto' });
	}
}