// GET REQUIRED LIBRARIES
import { VueApplication } from '../lib/fvtt-vue.js';

// GET MODULE CORE
import { MODULE } from '../_module.mjs';

// GET COMPONENTS
import { Manager } from '../components/manager.js';

// IMPORT DIALOGS
//import { Configure } from './configure.mjs';

export class ManagerApp extends VueApplication {
	constructor(options) { super(options); }
	
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: `${MODULE.TITLE} | ${MODULE.localize('manager.title')}`,
			id: `${MODULE.ID}-manager`,
			classes: MODULE.setting('minify') ? ['minify'] : [],
			width: window.innerWidth > 315 ? 315 : window.innerWidth - 100,
			height: "auto",
			// TODO: Add Support for Resizing
			resizable: false,
			// If User is GM, Allow Drag and Drop
			dragDrop: game.user.isGM ? [{ dropSelector: '.window-content' }] : [],
			component: Manager
		});
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
		let settings = this.vue.session.getSettings(this.vue.session.reputations.find(rep => rep.uuid == targetSection) ?? {});
		// Set Default Data Structure for Reputation
		let data = {
			"uuid": `${MODULE.ID}.${randomID()}`,
			"docUuid": document?.uuid ?? `${MODULE.ID}.${randomID()}`,
			"name": document?.name ?? `${MODULE.localize('reputation.title')} ${this.vue.session.reputations.length + 1}`,
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
		}else{
			// Update Document Name
			data.name = `${MODULE.localize('reputation.title')} ${this.vue.session.reputations.length + 1}`;
			// Unlink Document from Reputation
			delete data.docUuid;

		}

		// Add Reputation to Tracker
		this.vue.session.createReputation(data, targetSection);
    }

	activateListeners([elem]) {
		// If Dialog is Pinned, Move it to the Journal Sidebar
		if (MODULE.setting('trigger') == 'pinned' && document.querySelector('#sidebar #journal')) {
			document.querySelector('#sidebar #journal > header').insertAdjacentElement('beforeend', document.querySelector(`#${MODULE.ID}-manager`));
		}
	}
}