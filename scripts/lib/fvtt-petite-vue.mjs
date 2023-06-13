import { createApp, reactive } from './petite-vue.es.js';
//import { createApp, reactive } from './vue.esm-browser.js'

export const petiteVue = {
    template: {
        cache: new Map,
        get: async templatePath => petiteVue.template.cache.has(templatePath) ? petiteVue.template.cache.get(templatePath) 
        : await fetch(templatePath).then(response => {
            if (!response.ok) throw Error(response.statusText);
            return response.text()
        }).then(text => (petiteVue.template.cache.set(templatePath, text), petiteVue.template.cache.get(templatePath)))
        .catch(error => (console.error(error), false)),
        set: async templatePath => (petiteVue.template.cache.has(templatePath) && petiteVue.template.cache.delete(templatePath), petiteVue.template.cache.get(templatePath)),
        async delete(templatePath) {
            petiteVue.template.cache.delete(templatePath)
        }
    },
    helpers: {
        localize: (message, parameters = {}) => (foundry.utils?.isEmpty ?? foundry.utils?.isObjectEmpty)(parameters.hash ?? {}) ? game.i18n.localize(message) : game.i18n.format(message, parameters),
        l: (...args) => petiteVue.helpers.localize(...args)
    }
};

export class VueApplication extends Application {
    constructor(...args) {
        super(...args)
    }
    get store() {
        return this._vue.store
    }
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["vue-window-app"],
            submitOnClose: false,
            submitOnInput: false,
            autoUpdate: false
        })
    }
    async _renderInner(data) {
        let template = await petiteVue.template.get(this.template);
        if ("" === template) throw Error(`No data was returned from template ${this.template}`);
        let divElement = Object.assign(document.createElement("div"), {
            innerHTML: `<div v-scope @vue:mounted="mounted($el)" @vue:unmounted="unmounted($el)">${template}</div>`
        }),
        reactiveData = reactive(data);
        this._vue = {
            store: reactiveData,
            app: null
        };
        return $(divElement.firstChild)
    }
    async _activateCoreListeners(domElements) {
        super._activateCoreListeners(domElements);
        let rootElement = domElements[0];
        this._vue.app = createApp({
            ...mergeObject({
                store: this._vue.store
            }, mergeObject(petiteVue.helpers, {
                mounted: function(element) {
                    Hooks.callAll("mountedVueApplication", this, element)
                },
                unmounted: function(element) {
                    Hooks.callAll("unmountedVueApplication", this, element)
                }
            }))
        }).mount(rootElement.querySelector(".window-content > div"))
    }
    async close(options = {}) {
        let appElement = this.element[0],
            renderStates = Application.RENDER_STATES;
        if (options.force || [renderStates.RENDERED, renderStates.ERROR].includes(this._state)) {
            if (this._state = renderStates.CLOSING, !appElement) return this._state = renderStates.CLOSED;
            for (let baseClass of this.constructor._getInheritanceChain()) Hooks.call(`close${baseClass.name}`, this, this.element);
            return await new Promise(resolve => {
                appElement.addEventListener("transitionend", transitionEvent => {
                    this._vue.app.unmount(), this._vue = null, appElement.remove(), this._element = null, delete ui.windows[this.appId], this._minimized = false, this._scrollPositions = null, this._state = renderStates.CLOSED, resolve()
                }, {
                    once: true
                }), Object.assign(appElement.style, {
                    transformOrigin: "top right",
                    transition: "opacity 0.2s ease-in-out, height 0.2s ease-in-out",
                    opacity: 0,
                    height: 0
                })
            })
        }
    }
}
export class VueFormApplication extends FormApplication {
    constructor(...args) {
        super(...args);
        this._hookIds = [];
    }
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["vue-window-app"],
            submitOnInput: false,
            autoUpdate: false
        })
    }
    get store() {
        return this._vue.store
    }
    getData(options = {}) {
        return {
            object: this.object?.toObject() ?? this.object,
            options: this.options,
            title: this.title
        }
    }
    async _renderInner(data) {
        let template = await petiteVue.template.get(this.template);
        if ("" === template) throw Error(`No data was returned from template ${this.template}`);
        let divElement = Object.assign(document.createElement("div"), {
            innerHTML: `<form action="#" @vue:mounted="mounted($el)" @vue:unmounted="unmounted($el)">${template}</form>`
        }),
        reactiveObject = reactive(data?.object ?? data);
        this._vue = {
            store: reactiveObject,
            app: createApp({
                store: reactiveObject,
                ...{
                    ...petiteVue.helpers,
                    mounted: function(element) {
                        Hooks.callAll("mountedVueFormApplication", this, element)
                    },
                    unmounted: function(element) {
                        Hooks.callAll("unmountedVueFormApplication", this, element)
                    }
                }
            }).mount(divElement.firstChild)
        };
        this.form = divElement.querySelector("form");
        return $(divElement.firstChild)
    }
    async _activateCoreListeners(formElements) {
        console.log('_VUE_', this);
        if (super._activateCoreListeners(formElements), this.options.autoSync && this.object?.update)
            for (let schemaField of Object.values(this.object.schema.fields)) {
                if (!schemaField?.element?.documentName) continue;
                let eventTypes = ["create", "update", "delete"];
                eventTypes.forEach(eventType => {
                    let eventName = `${eventType}${schemaField.element.documentName}`;
                    this._hookIds.push([eventName, Hooks.on(eventName, (object, changeData, options, userId) => {
                        object.parent == this.object && mergeObject(this._vue.store, object.parent.toObject(), {
                            performDeletions: true
                        })
                    })])
                })
            }
    }
    async _updateObject() {
        this.object?.update && this._vue.store && await this.object.update(this._vue.store)
    }
    async close(closeOptions = {}) {
        let appElement = this.element[0],
            renderStates = Application.RENDER_STATES,
            isSubmit = closeOptions.submit ?? this.options.submitOnClose;
        for (let filePicker of (isSubmit && await this.submit({
                preventClose: true,
                preventRender: true
            }), this.filepickers)) filePicker.close();
        for (let editor of (this.filepickers = [], Object.values(this.editors))) editor.mce && editor.mce.destroy();
        this.editors = {};
        if (closeOptions.force || [renderStates.RENDERED, renderStates.ERROR].includes(this._state)) {
            if (this._state = renderStates.CLOSING, !appElement) return this._state = renderStates.CLOSED;
            for (let baseClass of this.constructor._getInheritanceChain()) Hooks.call(`close${baseClass.name}`, this, this.element);
            return await new Promise(resolve => {
                appElement.addEventListener("transitionend", transitionEvent => {
                    this._vue.app.unmount(), this._vue = null, appElement.remove(), this._element = null, delete ui.windows[this.appId], this._minimized = false, this._scrollPositions = null, this._state = renderStates.CLOSED, resolve()
                }, {
                    once: true
                }), Object.assign(appElement.style, {
                    transformOrigin: "top right",
                    transition: "opacity 0.2s ease-in-out, height 0.2s ease-in-out",
                    opacity: 0,
                    height: 0
                })
            })
        }
    }
}
