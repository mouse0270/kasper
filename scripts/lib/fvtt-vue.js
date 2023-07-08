import { createApp, ref  } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { MODULE } from '../_module.mjs';

// If template is contained in a <template> tag, remove it
function cleanVueTemplate(template) {
	// If Template is Contained in a <template> tag, remove it
	if (template.startsWith('<template') && template.endsWith('</template>')) {
		template = Object.assign(document.createElement('div'), { innerHTML: template }).firstChild.innerHTML;	
	}
	// Return Cleaned Template
	return template;
}

// Get Vue Template from Path
async function getVueTemplate(path, id = null) {
	// If Template is Cached, Return It
	if (_templateCache.hasOwnProperty(path)) return _templateCache[path];
	if (_templateCache.hasOwnProperty(id)) return _templateCache[id];

	const template = await fetch(path);
	if (!template.ok) throw Error(template.statusText);
	const text = cleanVueTemplate(await template.text());
	// Cache Template
	_templateCache[path ?? id] = { template: text };

	return _templateCache[path ?? id];
}

export class VueApplication extends Application {
	constructor(options={}) { super(options); }

	static get defaultOptions() {
		// Add vue-app to classes
		return mergeObject(super.defaultOptions, { classes: ['vue-app'], jQuery: false });
	}

	async _renderInner(data) {
		let template = this?.template ?? this?.options?.component?.template ?? null;

		// check if using file template
		if (typeof template === 'string') template = await getVueTemplate(template, this.id);
		
		// If template is empty, use component template, if thats empty, use empty div
		this.options.component.template = template?.template ?? this?.options?.component?.template ?? '<div></div>';
		return $(this.options.component.template);
	}

	async _activateCoreListeners(domElements) {
        super._activateCoreListeners(domElements);

		let app = this;
		// Create Container for Vue Application
		app.vue = {
			component: null,
			session: null
		}
		
		app.vue.component = createApp(mergeObject(app?.options?.component ?? {}, {
			data() {
				return mergeObject(app?.options?.component?.data() ?? {}, { app: app, }, { inplace: false });
			},
			updated() {
				// Call Updated Function from Component
				if (app?.options?.component?.updated) app?.options?.component?.updated?.call(this);

				// If Height is Auto or Undefined, Update Height
				if (app?.options?.height ?? 'auto' == 'auto')  app.setPosition({height: 'auto'});

				// Call Hooks
				Hooks.callAll(`updatedVueApplication`, app, this);
			},
			mounted() {
				// If Height is Auto or Undefined, Update Height
				if (app?.options?.height ?? 'auto' == 'auto')  app.setPosition({height: 'auto'});

				// Call Hooks
				Hooks.callAll(`mountedVueApplication`, app, this);

				// Call Mounted Function from Component
				if (app?.options?.component?.mounted) app?.options?.component?.mounted?.call(this);
			},
			unmounted() {
				// If Height is Auto or Undefined, Update Height
				if (app?.options?.height ?? 'auto' == 'auto')  app.setPosition({height: 'auto'});

				// Call Hooks
				Hooks.callAll(`unmountedVueApplication`, app, this);

				// Call Unmounted Function from Component
				if (app?.options?.component?.unmounted) app?.options?.component?.unmounted?.call(this);
			},
			methods: {
				localize: (...args) => args.length > 0 ? game.i18n.format(...args) : game.i18n.localize(args[0])
			}
		}, { inplace: false }));
		
		// Store Vue Data into App.Vue.Session
		app.vue.session = app.vue.component.mount(`#${this.id} .window-content`);
	}

	async render(force = false, options = {}) {
		// If Render is Called, make sure to unmount the component
		if (this?.vue?.component ?? false) this?.vue?.component.unmount();

		// Do FVTT Render Function
		super.render(force, options);
	}

	async close(options={}) {
		// If Render is Called, make sure to unmount the component
		if (this?.vue?.component ?? false) this?.vue?.component.unmount();

		// Do FVTT Close Function
		super.close(options);
	};
}

export class VueFormApplication extends FormApplication {
	constructor(object=null, options=null) {
		// If Object is Null, Options is Object, Object is Options
		if (!options) {
			options = object;
			object = object?.component?.data();
		}
		
		// Run FVTT FormApplication Constructor
		super(object ?? {}, options ?? {});

		// Attach Hook ID container
		this._hookIds = [];
	}

	static get defaultOptions() {
		// Add vue-app to classes
		return mergeObject(super.defaultOptions, { 
			classes: ['vue-app', 'vue-form-app'],
			jQuery: false,
			// TODO: Handle for AutoSync
			autoSync: false 
		});
	}

	async _renderInner(data) {
		let template = this?.template ?? this?.options?.component?.template ?? null;

		// check if using file template
		if (typeof template === 'string' && template.trim().endsWith('.vue')) template = await getVueTemplate(template, this.id);
		else if (typeof template === 'string' && template.trim().endsWith('>')) template = { template: template };

		// If template is empty, use component template, if thats empty, use empty div
		this.options.component.template = template?.template ?? this?.options?.component?.template ?? '';
		if (!this.options.component.template.startsWith('<form')) this.options.component.template = `<form>${this.options.component.template}</form>`;
		return $(this.options.component.template);
	}

	async _activateCoreListeners(domElements) {
        super._activateCoreListeners(domElements);

		let app = this;
		// Create Container for Vue Application
		app.vue = {
			component: null,
			session: null
		}

		app.vue.component = createApp(mergeObject(app?.options?.component ?? {}, {
			data() {
				return mergeObject(app?.options?.component?.data() ?? {}, { app: app, }, { inplace: false });
			},
			updated() {
				// Call Updated Function from Component
				if (app?.options?.component?.updated) app?.options?.component?.updated?.call(this);

				// If Height is Auto or Undefined, Update Height
				if (app?.options?.height ?? 'auto' == 'auto')  app.setPosition({height: 'auto'});

				// Call Hooks
				Hooks.callAll(`updatedVueApplication`, app, this);
			},
			mounted() {
				// If Height is Auto or Undefined, Update Height
				if (app?.options?.height ?? 'auto' == 'auto')  app.setPosition({height: 'auto', width: app?.options?.width ?? 'auto'});

				MODULE.log('Mounted', this, app);

				app.element[0].querySelector('form').addEventListener('submit', (event) => {
					event.preventDefault();
					MODULE.log('Submit', event, this, app);
				});
				
				// TODO: Work on Keydown for Submiting Form
				/*app.element[0].addEventListener('keydown', (event) => {
					MODULE.log('Keydown', event, this, app);
				});*/

				// Call Hooks
				Hooks.callAll(`mountedVueApplication`, app, this);

				// Call Mounted Function from Component
				if (app?.options?.component?.mounted) app?.options?.component?.mounted?.call(this);
			},
			unmounted() {
				// If Height is Auto or Undefined, Update Height
				//if (app?.options?.height ?? 'auto' == 'auto')  app.setPosition({height: 'auto'});

				// Call Hooks
				Hooks.callAll(`unmountedVueApplication`, app, this);

				// Call Unmounted Function from Component
				if (app?.options?.component?.unmounted) app?.options?.component?.unmounted?.call(this);
			},
			methods: {
				localize: (...args) => args.length > 0 ? game.i18n.format(...args) : game.i18n.localize(args[0])
			}
		}, { inplace: false }));
		
		// Store Vue Data into App.Vue.Session
		app.vue.session = app.vue.component.mount(`#${this.id} .window-content`);
		this.object = app.vue.session;

		// Attach Hooks for Form Application
		let eventTypes = ['create', 'update', 'delete'];
		if (this.autoSync && (this.object?.schema?.fields ?? false)) {
			for (let schemaField of Object.values(this.object.schema.fields)) {
				if (!schemaField?.element?.documentName) continue;
				eventTypes.forEach(eventType => {
					let eventName = `${eventType}${schemaField?.element?.documentName}`;
					this._hookIds.push(Hooks.on(eventName, (document, data) => {

					}));
				});
			}
		}
	}

	async render(force = false, options = {}) {
		// If Render is Called, make sure to unmount the component
		if (this?.vue?.component ?? false) this?.vue?.component.unmount();

		// Do FVTT Render Function
		super.render(force, options);
	}

	async close(options={}) {
		// If Render is Called, make sure to unmount the component
		if (this?.vue?.component ?? false) this?.vue?.component.unmount();

		// Do FVTT Close Function
		super.close(options);
	};
}