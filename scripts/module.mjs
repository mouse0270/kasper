// GET REQUIRED LIBRARIES

// GET MODULE CORE
import { MODULE } from './_module.mjs';

// IMPORT SETTINGS -> Settings Register on Hooks.Setup
import './_settings.mjs';

// IMPORT DIALOGS
import { Manager } from './dialogs/manager.mjs';

// DEFINE MODULE CLASS
export default class CORE {
	// MODULE SUPPORT FOR || socketlib ||
	static registerSocketLib = () => {
		this.socket = socketlib.registerModule(MODULE.ID);
	}

	static installAPI = () => {
		game.modules.get(MODULE.ID).API = {
			getFaction: (uuid) => {
				return 'Not Implemented';
			}
		};
	}

	static init = () => {
		this.installAPI();
	}

	static async renderSidebarTab (app, elem, options) {
		// Check if User is GM
		if (!game.user.isGM) return;

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
			new Manager({}).render(true);
		});

		if (MODULE.setting('trigger') == 'pinned') {
			if (!Object.entries(ui.windows).find(w => w[1].id == `${MODULE.ID}-manager`)?.[1]) new Manager({}).render(true);

			elem[0].querySelector(`header.directory-header .header-actions button[data-action="open-${MODULE.ID}"]`).style.display = 'none';
		} 
	};

	static async updateItem (document, data, options, userId) {
		// Get State from Active Window or Storage
		const updateWindow = Object.entries(ui.windows).find(w => w[1].id == "kasper-manager")?.[1]?._vue?.store?.reputations ?? MODULE.setting('storage');
	
		// Handle for when Document is in mutliple Reputation Trackers
		updateWindow.forEach(rep => {
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
		const updateWindow = Object.entries(ui.windows).find(w => w[1].id == "kasper-manager")?.[1]?._vue?.store?.reputations ?? MODULE.setting('storage');
	
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