// GET REQUIRED LIBRARIESManagerApp

// GET MODULE CORE
import { MODULE } from './_module.mjs';

// IMPORT SETTINGS -> Settings Register on Hooks.Setup
import './_settings.mjs';

// IMPORT DIALOGS
//import { Manager } from './dialogs/manager.mjs';
import { ManagerApp } from './dialogs/manager.mjs';

// DEFINE MODULE CLASS
export default class CORE {
	// MODULE SUPPORT FOR || socketlib ||
	static registerSocketLib = () => {
		this.socket = socketlib.registerModule(MODULE.ID);
	}

	static installAPI = () => {
		// TODO: API
		game.modules.get(MODULE.ID).API = {
			// Add Preset
			addPreset: (preset) => {
				// Check if Preset already Exists
				if (MODULE.setting('presets').some(p => p.key === preset.key)) return;

				// Add Preset to Presets
				MODULE.setting('presets').push(preset);
			},
		};
		// The API is not ready
		return;
	}

	static init = () => {
		this.installAPI();
	}

	static async renderSidebarTab (app, elem, options) {
		// Check if User is GM
		//if (!game.user.isGM) return;

		// Check if Hook is for Journal
		if (!['journal', 'journal-popout'].includes(app.id))  return;
	
		// Check if Button Already Exists
		if (elem[0].querySelector(`header.directory-header .header-actions button[data-action="open-${MODULE.ID}"]`) ?? false) return;
	
		// Add Button to Journal Tab
		elem[0].querySelector('header.directory-header .header-actions').insertAdjacentHTML('afterend', `<div class="header-actions action-buttons flexrow"><button data-action="open-${MODULE.ID}">
			<i class="fa-regular fa-bars-progress"></i> ${MODULE.TITLE.replace("👻", '')}
		</button></div>`);
	
		// Add Event Listener to Button
		elem[0].querySelector(`header.directory-header .header-actions button[data-action="open-${MODULE.ID}"]`).addEventListener('click', async (event) => {
			event.preventDefault();
			// Open Mangager or Focus if already open
			new ManagerApp({}).render(true);
		});

		if (MODULE.setting('trigger') == 'pinned') {
			if (!Object.entries(ui.windows).find(w => w[1].id == `${MODULE.ID}-manager`)?.[1]) new ManagerApp({}).render(true);

			elem[0].querySelector(`header.directory-header .header-actions button[data-action="open-${MODULE.ID}"]`).style.display = 'none';
		} 
	};

	static async createItem (document, options, userId) {
		// Get State from Active Window or Storage
		const updateWindow = Object.entries(ui.windows).find(w => w[1].id == "kasper-manager")?.[1]?.vue?.session?.reputations ?? MODULE.setting('storage');

		// Get Parent Document, If it Exists, otherwise return
		const parentDocument = document?.parent ?? null;
		if (!parentDocument) return;

		// Check if Parent Document is in Reputation Tracker
		const reputation = updateWindow.find(rep => (rep?.docUuid ?? '') == parentDocument.uuid);
		if (!reputation) return;

		const settings = mergeObject(MODULE.setting('globalDefaults'), reputation?.settings ?? {});

		// Add Faction to Reputation Tracker
		reputation.factions.push({
			uuid: `${MODULE.ID}.${randomID()}`,
			docUuid: document.uuid,
			name: document.name,
			reputation: settings?.default ?? 0,
		});
				
		// Store New Name
		MODULE.setting('storage', updateWindow);

		// Resize Window if Open
		if (Object.entries(ui.windows).find(w => w[1].id == `${MODULE.ID}-manager`)?.[1]) {
			setTimeout(() => {
				Object.entries(ui.windows).find(w => w[1].id == "kasper-manager")?.[1].setPosition({ height: 'auto' });
			}, 1);
		}
	};

	static async updateItem (document, data, options, userId) {
		// Get State from Active Window or Storage
		const updateWindow = Object.entries(ui.windows).find(w => w[1].id == "kasper-manager")?.[1]?.vue?.session?.reputations ?? MODULE.setting('storage');
	
		// Handle for when Document is in mutliple Reputation Trackers
		updateWindow.forEach(rep => {
			// Check if Reputation Tracker is Linked to Document
			if ((rep?.docUuid ?? '') == document.uuid) {
				// If Document is Updated, than Update Reputation Tracker
				rep.name = document.name;
			}

			// Check if each Reputation Tracker has Document in Factions
			if (!rep.factions.find(fac => fac.docUuid == document.uuid)) return;
	
			// Handle for when Document is in Multiple Factions
			rep.factions.forEach(fac => {
				if (fac.docUuid != document.uuid) return;
	
				// If Document is Updated, than Update Reputation Tracker
				fac.name = document.name;
			});
		});
				
		// Store New Name
		MODULE.setting('storage', updateWindow);
	};

	static async deleteItem (document, options, userId) {
		// Get State from Active Window or Storage
		const updateWindow = Object.entries(ui.windows).find(w => w[1].id == "kasper-manager")?.[1]?.vue?.session?.reputations ?? MODULE.setting('storage');
	
		// If Document is not Found in Faction list, than return
		if (!updateWindow.find(rep => rep.factions.find(fac => fac.docUuid == document.uuid))) return;
	
		new Dialog({
			title: "Confirmation",
			content: "<p>Linked Document Found, Would you like to remove it from KASPER aswell?</p>",
			buttons: {
				yes: {
					icon: '<i class="fas fa-check"></i>',
					label: "Yes",
					callback: () => {
						// Filter out Faction from Reputation Tracker
						updateWindow.forEach(rep => {
							rep.factions = rep.factions.filter(fac => fac.docUuid != document.uuid);
						});
	
						// Update Storage
						MODULE.setting('storage', updateWindow);
	
						if (Object.entries(ui.windows).find(w => w[1].id == "kasper-manager")?.length > 0) {
							setTimeout(() => {
								Object.entries(ui.windows).find(w => w[1].id == "kasper-manager")?.[1]?.setPosition({ height: 'auto' }) ?? false;
							}, 1);
						}
					},
				  },
				no: {
					icon: '<i class="fas fa-times"></i>',
					label: "No",
					callback: () => {
						// Update UUID to be Generic Faction
						updateWindow.forEach(rep => {
							// Check if each Reputation Tracker has Document in Factions
							if (!rep.factions.find(fac => fac.docUuid == document.uuid)) return;
	
							// Handle for when Document is in Multiple Factions
							rep.factions.forEach(fac => {
								if (fac.docUuid != document.uuid) return;
	
								// If Document is Updated, than Update Reputation Tracker
								fac.docUuid = `${MODULE.ID}.${randomID()}`;
							});
						});
	
						// Update Storage
						MODULE.setting('storage', updateWindow);
					}
				},
			},
			default: "no",
			close: () => console.log("Dialog closed"), // Optional close callback
		}).render(true);
	};
}