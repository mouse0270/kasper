// GET REQUIRED LIBRARIES
import { VueFormApplication } from '../lib/fvtt-petite-vue.mjs';

// GET MODULE CORE
import { MODULE } from '../_module.mjs';

export class VueDialog extends VueFormApplication {
	constructor(...args) {
		super();

		let data = {};
		// Check if args is an array
		if (Array.isArray(args)) {
			data.content = args[0];

			if (args.length > 1) data.callback = args[1];
		}

		this.data = mergeObject({
			title: '',
			content: '',
			size: 'auto',
			buttons: {
				yes: {
					icon: '<i class="fas fa-check"></i>',
					label: game.i18n.localize('Yes'),
					callback: () => { },
				}
			},
			callback: () => { },
		}, data);

		console.log('_VUE_DIALOG', this, args);
	}

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: `${MODULE.TITLE} | ${MODULE.localize('configure.title')}`,
			id: `${MODULE.ID}-configure`,
			classes: [],
			template: `./modules/${MODULE.ID}/templates/dialog.vue`,
			resizable: false,
			width: window.innerWidth > 450 ? 450 : window.innerWidth - 100,
			height: "auto",
		});
	}

	async getData() {
		// Get Settings Defaults

		return {
			ID: MODULE.ID,
		}
	}

	activateListeners(html) {
		super.activateListeners(html);
		const elem = html[0];
	}
}