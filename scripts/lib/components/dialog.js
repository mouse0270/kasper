import { VueFormApplication } from "../fvtt-vue.js";
import { VueComponentInput } from "./inputs.js";

export class VueDialog extends VueFormApplication {
	constructor(options = {}) {
		options = mergeObject({
			component: {
				template: /*html*/`<div class="dialog-content" v-html="content"></div>
				<div class="dialog-buttons">
					<button v-for="(button, bKey) in buttons" data-parent="defaultBtn" :type="bKey == (defaultBtn ?? '') ? 'submit' : 'button'" :class="{'dialog-button':true}" :key="bKey" @click="button.callback">{{button.label}}</button>
				</div>`
			}
		}, options, {inplace: false});
		if (options.component.data()?.template) options.component.template = options.component.data().template;

		super(options);
	}

	static get defaultOptions() {
		// Add vue-app to classes
		return mergeObject(super.defaultOptions, { 
			classes: ['dialog', 'vue-dialog'],
			width: 400,
		});
	}

	async close(options={}) {
		if (this?.options?.close) this.options.close();
		super.close(options);
	}

	static async Alert(...args) {
		// Hold on Lets Setup your Options
		let options = mergeObject({
			buttons: {
				'ok': {
					label: 'OK',
					callback: () => true
				}
			},
			defaultBtn: 'ok',
		}, typeof args[0] == 'object' ? args[0] : {}, {inplace: false});

		// If First Argument is a String, Set it as Content
		if (typeof args[0] == 'string') options.content = args[0];
		if (typeof args[1] == 'function') options.buttons = { 'ok': { callback: args[1] } };

		// Wait for User Response
		return await this.wait({ data() { return options; }});
	}

	static async Confirm(...args) {
		// Hold on Lets Setup your Options
		// Define Default Options
		let options = mergeObject({
			buttons: {
				'ok': {
					icon: '<i class="fa-regular fa-check"></i>',
					label: 'OK',
					callback: () => true
				},
				'cancel': {
					icon: '<i class="fa-regular fa-xmark"></i>',
					label: 'Cancel',
					callback: () => null
				}
			},
			defaultBtn: 'ok',
		}, typeof args[0] == 'object' ? args[0] : {}, {inplace: false});

		// If First Argument is a String, Set it as Content
		if (typeof args[0] == 'string') options.content = args[0];
		if (typeof args[1] == 'function') options.buttons = mergeObject(options.buttons, { 'ok': { callback: args[1] } }, {inplace: false});
		if (typeof args[2] == 'function') options.buttons = mergeObject(options.buttons, { 'cancel': { callback: args[2] } }, {inplace: false});
	
		// Wait for User Response
		return await this.wait({ data() { return options; }});
	}

	static async Prompt(...args) {
		// Hold on Lets Setup your Options
		let template = /*html*/`<div class="dialog-content">
			<div class="dialog-vue-html" v-html="content"></div>
			<VueComponentInput v-bind="input" :value="input.value" @input="handleInputChange" />
		</div>
		<div class="dialog-buttons">
			<button v-for="(button, bKey) in buttons" :type="bKey == (defaultBtn ?? '') ? 'submit' : 'button'" :class="{'dialog-button':true}" :key="bKey" @click="button.callback">{{button.label}}</button>
		</div>`
		// Define Default Options
		let options = mergeObject({
			buttons: {
				'ok': {
					icon: '<i class="fa-regular fa-check"></i>',
					label: 'OK',
					callback() {
						// If input is type="checkbox" convert boolean to on/off
						let value = this.object.input.value
						if (typeof value == 'boolean') value = value ? 'on' : 'off';

						if (value.length == 0) return false;

						return value;
					}
				},
				'cancel': {
					icon: '<i class="fa-regular fa-xmark"></i>',
					label: 'Cancel',
					callback: () => null
				}
			},
			defaultBtn: 'ok',
		}, typeof args[0] == 'object' ? args[0] : {}, {inplace: false});

		// If First Argument is a String, Set it as Content
		if (typeof args[0] == 'string') options.content = args[0];
		if (typeof args[1] == 'object') options.input = args[1];
		if (typeof args[2] == 'function') options.buttons = mergeObject(options.buttons, { 'ok': { callback: args[2] } }, {inplace: false});
		if (typeof args[3] == 'function') options.buttons = mergeObject(options.buttons, { 'cancel': { callback: args[3] } }, {inplace: false});
	
		// Wait for User Response
		return await this.wait({ 
			components: { VueComponentInput },
			data() { return mergeObject(options, {input: { inputValue: options.input.value }}, {inplace: false}); },
			template: template,
			methods: {
				handleInputChange(payload) {
					let value = payload?.target?.value ?? payload;
				  	if ((payload?.target ?? false) && value != this.input.value) {
						if (payload?.target?.type == 'number' || payload?.target?.type == 'range') value = Number(payload.target.value);
						else if (payload?.target?.type == 'checkbox') value = payload.target.checked;
						else value = payload.target.value;

						this.input.value = value;
					}
					
				},
			},
			mounted() {
				if (this.$el.querySelector('input')) this.$el.querySelector('input').focus();
				else if (!this.$el.querySelector('input')) this.$el.querySelector('select').focus();
				else if (!this.$el.querySelector('input') && !this.$el.querySelector('select')) this.$el.querySelector('textarea').focus();
				else this.$el.querySelector('button[type="submit"]').focus();
			}
		});
	}

	static async wait(component = {}) {
		return new Promise((resolve, reject) => {
			let buttons = component?.data()?.buttons ?? {};

			for (const [id, button] of Object.entries(buttons)) {
				if (button?.callback ?? false) {
					let cb = button.callback;
					function callback(event, html) {
						html = html ?? event.target.closest('.vue-dialog');
						const app = Object.entries(ui.windows).find(w => w[0] == html.dataset.appid)?.[1] ?? null;
						// WindowApp, HTML, Event, Session Data
						const result = cb instanceof Function ? cb.call(app, event.target.closest('.vue-dialog'), event, app.vue.session) : undefined;
						
						if (result !== false) {
							resolve(result ?? id);
							app.close();
						}
					};
					buttons[id].callback = callback
				}
			}

			const originalClose = component?.close;
			const close = () => {
				const result = originalClose instanceof Function ? originalClose() : undefined;
				if ( result !== undefined ) resolve(result);
				else reject(new Error("The Dialog was closed without a choice being made."));
			};

			let data = mergeObject(component?.data() ?? {}, {
				buttons: buttons
			}, {inplace: false});

			component = mergeObject(component, {
				data() {
					return data;
				}
			}, {inplace: false});

			const dialog = new this({component: component, close: close});
			dialog.render(true);
		});
	}
}
  
export default VueDialog;