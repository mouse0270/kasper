// IMPORT SORTABLE.JS
import Sortable from '../lib/sortable.core.esm.js';

// GET MODULE CORE
import { MODULE } from '../_module.mjs';

// Get Configuration Dialog
import { ConfigureApp } from '../dialogs/configure.mjs';

export const Manager = {
	data() {
		return {
			ModuleID: MODULE.ID,
			userIsGM: game.user.isGM,
			reputations: MODULE.setting('storage') ?? [],
		}
	},
	updated() {
		// If user added a new reputation, add sortable to it
		// TODO: Fix duplicate sortable on drop
		const isNewReputation = (event) => {
			// If event is triggered by a button[add-reputation] add sortable
			if (event.target?.closest('button')?.dataset?.action == 'add-reputation') return true;

			// if event is a drop event
			else if ((event?.type ?? '') == 'drop') {
				// Get Reputation Uuid from dropped faction
				const reputationUuid = event.target.closest('section')?.id ?? null;
				// Get Reputation Uuid from last reputation
				const lastReputationUuid = this.$el.querySelector('.sortablejs-reputation section:last-child')?.id ?? null;

				return reputationUuid != lastReputationUuid;
			}
			
			return false;
		}

		// Exclude type message
		if (event.type == 'message') return;

		if (isNewReputation(event)) {
			// Get Sortable Element
			const sortableFaction = this.$el.querySelector('.sortablejs-reputation section:last-child ul');
			// Add Sortable to Element
			this.setSortable(sortableFaction, { group: 'faction' });
		}
	},
	mounted() {
		// Define Viewable by Player
		function cmTogglePlayerView(self, elem) {
			// Get Reputation UUID
			const reputationUuid = elem.closest('section').id;

			// Update if Player can View Reputation
			self.reputations.find(rep => rep.uuid == reputationUuid).viewable = !self.reputations.find(rep => rep.uuid == reputationUuid)?.viewable ?? false;

			// Save Reputations
			MODULE.setting('storage', self.reputations);

			MODULE.log('cmTogglePlayerView', self, self.reputations);
		}
		// Define Configure Context Menu Function
		function cmConfigure(self, elem) {
			// Get Reputation UUID
			const reputationUuid = elem.closest('section').id;
			const factionUuid = elem.closest('li')?.id ?? null;
			MODULE.log('reputationUuid', reputationUuid, 'factionUuid', factionUuid);
			// Open Configure Dialog
			new ConfigureApp({ reputationUuid: reputationUuid, factionUuid: factionUuid}).render(true);
		}
		// Define Delete Context Menu Function
		function cmDelete(self, elem) {
			// Get Reputation and Faction UUID
			const reputationUuid = elem.closest('section')?.id ?? null;
			const factionUuid = elem.closest('li')?.id ?? null;

			// If faction isn't null, remove faction from reputation
			if (factionUuid) self.reputations.find(rep => rep.uuid == reputationUuid).factions = self.reputations.find(rep => rep.uuid == reputationUuid).factions.filter(fac => fac.uuid != factionUuid);
			else self.reputations = self.reputations.filter(rep => rep.uuid != reputationUuid);
			
			// Save Reputations
			MODULE.setting('storage', self.reputations);

			// Update UI
			setTimeout(() => { self.app.setPosition({ height: 'auto' }); }, 1);
		}

		// Create Function to Determin if Reputation is Viewable by Players
		// - Used to display if ContextMenu Option is Show or Hide
		const isViewable = (elem) => {
			// Get Reputation UUID
			const reputationUuid = elem.closest('section').id;

			// Return if Players can See Reputation
			return this.reputations.find(rep => rep.uuid == reputationUuid)?.viewable ?? false;
		}

		// Dine Context Menu Options
		const cmOptions = [{
			name: game.i18n.localize('Configure'),
			icon: '<i class="fa-regular fa-sliders"></i>',
			condition: game.user.isGM,
			callback: (([elem]) => cmConfigure(this, elem))
		}, {
			name: game.i18n.localize('Delete'),
			icon: '<i class="fa-regular fa-trash-can-xmark"></i>',
			condition: game.user.isGM,
			callback: (([elem]) => cmDelete(this, elem))
		}]

		// Add Context Menu Options to Reputation and Faction
		new ContextMenu(this.$el, 'section header', [{
			name: MODULE.localize('manager.contextMenu.togglePlayerView.hide'),
			icon: '<i class="fa-regular fa-eye-slash"></i>',
			condition: ([elem]) => game.user.isGM && isViewable(elem),
			callback: (([elem]) => cmTogglePlayerView(this, elem))
		}, {
			name: MODULE.localize('manager.contextMenu.togglePlayerView.show'),
			icon: '<i class="fa-regular fa-eye"></i>',
			condition: ([elem]) => game.user.isGM && !isViewable(elem),
			callback: (([elem]) => cmTogglePlayerView(this, elem))
		}].concat(cmOptions));
		new ContextMenu(this.$el, 'section ul li', cmOptions);

		// Create Sortable for Reputations
		this.setSortable(this.$el.querySelector('.sortablejs-reputation'), {
			// Changed sorting within list
			onEnd: (event) => {
				// Get Moved Item
				const item = this.reputations.splice(event.oldIndex, 1)[0];

				// Update Reputation Array
				this.reputations.splice(event.newIndex, 0, item);

				// Save to Storage
				MODULE.setting('storage', this.reputations);
			}
		});

		// Create Sortable for Factions
		this.$el.querySelectorAll('.sortablejs-reputation ul').forEach((sortableFaction, index) => {
			this.setSortable(sortableFaction, { group: 'faction' });
		});
	},
	methods: {
		setSortable(elem, options = null) {
			options = mergeObject({
				animation: 150,
				 // handle's class
				handle: '[data-action="sortable"]',
				// Remove Tooltips on Start of Drag
				onStart(event) { game.tooltip.deactivate() },
				// Changed sorting within list
				onEnd: (event) => {
					// Get Reputation UUIDs
					const sourceRepuation = event.from.closest('section').id;
					const targetReputation = event.to.closest('section').id;
					// Get Reputation Arrays
					const sourceReputationArray = this.reputations.find(rep => rep.uuid == sourceRepuation).factions;
					const targetReputationArray = this.reputations.find(rep => rep.uuid == targetReputation).factions;
	
					// Get Moved Item
					const item = sourceReputationArray.splice(event.oldIndex, 1)[0];
					// Update Reputation Array
					targetReputationArray.splice(event.newIndex, 0, item);
			
					// Save to Storage
					MODULE.setting('storage', this.reputations);
				}
			}, options ?? {}, { inplace: false });
	
			// Enable Sortable 
			new Sortable(elem, options);
		},
		getSettings(reputation = null, faction = null) {
			// Get Settings from Global => Reputation => Faction
			let settings = MODULE.setting('globalDefaults');
			if (reputation?.settings ?? false) settings = reputation.settings;
			if (faction?.settings ?? false) settings = faction.settings;
	
			// Check if settings has a preset
			let presets = MODULE.setting('presets');
			// Check if settings has a preset
			if ((settings?.preset ?? false) && (settings.preset !== 'custom')) {
				// Check if preset exists
				if (presets.find(preset => preset.key === settings.preset)?.settings ?? false) settings = presets.find(preset => preset.key === settings.preset).settings;
			}
			
			// Check if settings 
			return settings;
		},
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
			
			// Return Conditions
			return conditions;
		},
		getStyle(reputation, faction, elem) {
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
		getLabel(reputation, faction) {
			// Get Conditions from Global => Reputation => Faction
			let conditions = this.getConditions(reputation, faction);

			// Get Label based on Reputation Value
			let label = conditions.tiers.find(searchLabel =>  faction.reputation <= searchLabel[0]);

			// Return label or Unknown
			return label?.[1] ?? game.i18n.translations.Unknown;
		},
		// Event Listeners
		onInputRangeWheel(event) {
			// Get Range Input
			const input = event.target;
			// TODO: Let user set Keybindings
			let escapeKey = MODULE.setting('disableWheel') ? 'ctrlKey' : false;
			let stepKey = 'shiftKey';

			// Define Step Modifier
			// TODO: Let user adjust step modifier
			const stepModifier = 5;

			// Is Scrolling Allowed			
			let isScrollingAllowed = escapeKey && (event[escapeKey] || escapeKey == 'none');
			
			// Check If Disable Mouse Wheel Sliders is Active, if so exit
			if (game.modules.get('disable-mouse-wheel-sliders')?.active) {
				// Get If Range Sliders Change on Wheel is disabled
				const isRangeWheelDisabled = game.settings.get('disable-mouse-wheel-sliders', 'disable-mouse-wheel-sliders');
				// Get If User is Holding Down an Escape Key
				const isEscapeKeyPressed = game.keybindings.get('disable-mouse-wheel-sliders', "escape-key").some(keys => window.keyboard.downKeys.has(keys.key))

				// Check if Range Sliders is Disabled
				isScrollingAllowed = isRangeWheelDisabled && isEscapeKeyPressed;
			};

			// Prevent Mouse Wheel from Adjusting Input Range Value
			event.preventDefault();
			event.stopPropagation();

			// If Escape Key is not pressed, exit
			if (!isScrollingAllowed) return;

			MODULE.debug('onInputRangeWheel', 'Escape Key is Pressed');

			// Adjust the range slider by the step size
			const step = ((parseFloat(input.step) || 1.0) * Math.sign(-1 * event.deltaY) * (event[stepKey] ? ((parseFloat(input.step) || 1.0) * stepModifier) : parseFloat(input.step) || 1.0));
			input.value = Math.clamped(parseFloat(input.value) + step, parseFloat(input.min), parseFloat(input.max));

			// Dispatch Change Event
			input.dispatchEvent(new Event('change', { bubbles: true }));
		},
		onContentEditableKeydown(event) {
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
		onNameChange(event) {
			// Get Reputation and Faction UUIDs assume null if not found
			let reputationUuid = event.target.closest('section')?.id ?? null;
			let factionUuid = event.target.closest('li')?.id ?? null;

			// If Reputation UUID is null, exit
			if (!(this.reputations.find(rep => rep.uuid == reputationUuid)?.name ?? false)) return;

			// If Faction UUID exists, update Faction Name otherwise update Reputation Name
			if (factionUuid) this.reputations.find(rep => rep.uuid == reputationUuid).factions.find(faction => faction.uuid == factionUuid).name = event.target.innerText;
			else this.reputations.find(rep => rep.uuid == reputationUuid).name = event.target.innerText;
			
			// Save to Storage
			MODULE.setting('storage', this.reputations);
		},
		onReputationChange(event) {
			// Get Reputation and Faction UUIDs assume null if not found
			const reputationUuid = event.target.closest('section')?.id ?? null;
			const factionUuid = event.target.closest('li')?.id ?? null;
			// Get Reputation and Faction
			let reputation = this.reputations.find(rep => rep.uuid == reputationUuid) ?? null;
			let faction = reputation?.factions.find(faction => faction.uuid == factionUuid) ?? null;
			// Get Conditions, Action Type and Modifier Value
			let conditions = this.getConditions(reputation, faction);
			let type = 'set', modifier = 1;

			// If user clicked a button, get the type
			if (event.target.closest('button')) type = event.target.closest('button').dataset.action;
			if (type !== 'set' && event.shiftKey) modifier = 5;

			// If faction was not found, exit
			if (!faction) return;

			// Set Faction Value
			if (type == 'set') faction.reputation = event.target.value * 1;
			else if (type == 'increase' && faction.reputation < conditions.max) faction.reputation = Number(faction.reputation) + modifier;
			else if (type == 'decrease' && faction.reputation > conditions.min) faction.reputation = Number(faction.reputation) - modifier;

			// Make sure value is within min and max
			if (faction.reputation < conditions.min) faction.reputation = conditions.min;
			if (faction.reputation > conditions.max) faction.reputation = conditions.max;


			// Save to Storage
			MODULE.setting('storage', this.reputations);
		},
		createReputation(data = null, target = null) {
			// If target is not null, verify it exists
			if (target && !this.reputations.find(rep => rep.uuid == target)) target = null;

			// If data is null, create a new reputation
			if (!(data?.uuid ?? false)) data = {
				uuid: `${MODULE.ID}.${randomID()}`,
				name: `${MODULE.localize('reputation.title')} ${this.reputations.length + 1}`,
				factions: []
			}

			// If there is no target, add reputation to list, otherwise add faction(s) to target
			if (!(target ?? false)) this.reputations.push(data);
			else this.reputations.find(rep => rep.uuid == target).factions.push(...(data?.factions ?? []));

			// Save to Storage
			MODULE.setting('storage', this.reputations);
		},
		addFaction(event) {
			// Get Reputation UUID if it exists, otherwise exit
			const reputationUuid = event.target.closest('section')?.id ?? null;
			if (!reputationUuid) return;

			// Get Settings
			let settings = this.getSettings(this.reputations.find(rep => rep.uuid == reputationUuid));

			// Create Faction Data
			const data = {
				uuid: reputationUuid,
				factions: [{
					uuid: `${MODULE.ID}.${randomID()}`,
					name: `${MODULE.localize('reputation.faction.title')} ${this.reputations.find(rep => rep.uuid == reputationUuid).factions.length + 1}`,
					reputation: settings.default
				}]
			}

			// Add Faction to Reputation Tracker
			this.createReputation(data, reputationUuid);
		}
	},
	template: `./modules/${MODULE.ID}/templates/manager.vue`
}