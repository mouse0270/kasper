export const VueComponentInput = {
	props: ['type', 'label', 'value', 'min', 'max', 'step', 'hint', 'choices'],
	data() {
		return { internalValue: this.value };
	},
	watch: {
		value(newValue) { this.internalValue = newValue; },
	},
	methods: {
		updateValue(event) {
			this.internalValue = event.target.value;
			this.$emit('input', this.internalValue);
		},
		getType(type, input) {
			// If type is not defined, try to get it from value
			if (!(type ?? false)) type = typeof input?.value ?? String;
			// If value is not defined, assume string
			if (!(input?.value ?? false)) input.value = '';
		
			// If Type is Number or 'number'
			if (typeof input?.choices === 'object') return 'select';
			else if ([Number, 'number'].includes(type) && ((input?.min ?? false) || (input?.max ?? false))) return 'range';
			else if ([Number, 'number'].includes(type)) return 'number';
			else if ([Boolean, 'boolean'].includes(type)) return 'checkbox';
			else if (['color'].includes(type)) return 'color';
			else return 'text';
		}
	},
	template: /*html*/`<div class="form-group">
	<label>{{label}}</label>
	<div class="form-fields">
		<select v-if="getType(type, {value: value ?? null, choices: choices}) == 'select'" @change="updateValue">
			<option v-for="(choice, cKey) in choices" :value="cKey" :selected="cKey == internalValue">{{choice}}</option>
		</select>
		<div v-else-if="getType(type, {value: value ?? null, min: min ?? null, max: max ?? null}) == 'range'" style="display: flex">
			<input type="range" :value="internalValue" :min="min" :max="max" :step="step ?? 1" @change="updateValue" style="margin-right: 0.5rem" />
			<input type="number" :value="internalValue" :max="max" :step="step ?? 1" @input="updateValue" style="flex: 0 1 50px; text-align: center;" />
		</div>
		<input v-else-if="getType(type, {value: value ?? null}) == 'number'" type="number" :value="internalValue" @input="updateValue" style="text-align: right;" />
		<input v-else-if="getType(type, {value: value ?? null}) == 'checkbox'" type="checkbox" :checked="internalValue" />
		<input v-else-if="getType(type, {value: value ?? null}) == 'color'" type="color" :value="internalValue" @input="updateValue" />
		<select v-else-if="getType(type, {value: value ?? null, choices: choices}) == 'select'" @change="updateValue">
			<option v-for="(choice, cKey) in choices" :value="cKey" :selected="cKey == internalValue">{{choice}}</option>
		</select>
		<input v-else type="text" :value="internalValue" @input="updateValue" />
	</div>
	<p v-if="(hint ?? false) && (hint ?? '').length > 0" class="notes">{{hint}}</p>
</div>`,
}