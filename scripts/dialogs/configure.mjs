// GET REQUIRED LIBRARIES
import { VueFormApplication } from '../lib/fvtt-vue.js';

// GET MODULE CORE
import { MODULE } from '../_module.mjs';

// GET COMPONENTS
import { Configure } from '../components/configure.js';


export class ConfigureApp extends VueFormApplication {
	constructor(options) { super(options); }
	
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: `${MODULE.TITLE} | ${MODULE.localize('configure.title')}`,
			id: `${MODULE.ID}-configure`,
			classes: [],
			width: window.innerWidth > 450 ? 450 : window.innerWidth - 100,
			height: "auto",
			resizable: false,
			component: Configure
		});
	}
}