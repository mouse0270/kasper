<main :class="ModuleID">
	<header>
		<h1>{{localize(`${ModuleID}.configure.title`)}}</h1>
		<h4>Define Global Settings</h4>
	</header>
	<h3>{{localize('Preview')}}</h3>
	<section class="preview">
		<ul>
			<li :id="`${ModuleID}.Preview`">
				<div class="form-group" :data-is-colorized="faction.colorize" :style="getStyle(faction, $el)">
					<label for="faction">{{localize(`${ModuleID}.reputation.faction.title`)}}</label>
					<input type="range" v-model="faction.value" :min="faction.min" :max="faction.max" step="faction.step">
					<p class="notes">{{getLabel(faction)}} ({{faction.value}})</p>
				</div>
				<button data-action="decrease" :data-tooltip="localize(`${ModuleID}.manager.decreaseReputation`)" @click="onChangeReputation"><i class="fa-regular fa-circle-minus"></i></button>
				<button data-action="increase" :data-tooltip="localize(`${ModuleID}.manager.increaseReputation`)" @click="onChangeReputation"><i class="fa-regular fa-circle-plus"></i></button>
			</li>
		</ul>
	</section>
	<h3>{{localize(`${ModuleID}.configure.settings.title`)}}</h3>
	<section>
		<div class="form-group">
            <label><strong>{{localize(`${ModuleID}.configure.settings.presets.name`)}}</strong></label>
            <div class="form-fields">
                <select @change="onChangePreset($event)">
					<option v-if="!isGlobal" value="inherit">{{localize(`${ModuleID}.configure.settings.presets.inherit.name`)}}</option>
					<option v-for="(preset, pIdx) in PRESETS" :key="preset.key" :value="preset.key" :selected="faction.preset == preset.key">{{preset.name}}</option>
					<option v-if="isGlobal || overrideSettings" value="custom" :selected="faction.preset == 'custom'">{{localize(`${ModuleID}.configure.settings.presets.custom.name`)}}</option>
				</select>
            </div>
			<p class="notes">{{localize(`${ModuleID}.configure.settings.presets.hint`)}}</p>
		</div>
		<div class="form-group" v-if="!isGlobal">
            <label><strong>{{localize(`${ModuleID}.configure.settings.override.name`)}}</strong></label>
            <div class="form-fields">
                 <input type="checkbox" v-model="overrideSettings" :checked="overrideSettings" @change="onChangeOverrideSettings">
            </div>
			<p class="notes">{{localize(`${ModuleID}.configure.settings.override.hint`)}}</p>
		</div>
		<div class="form-group">
			<label><strong>{{localize(`${ModuleID}.configure.settings.minimum.name`)}}</strong></label>
			<div class="form-fields">
				<input type="number" v-model="faction.min" :max="faction.max" :step="faction.step" :disabled="!overrideSettings && !isGlobal">
			</div>
			<p class="notes">{{localize(`${ModuleID}.configure.settings.minimum.hint`)}}</p>
		</div>
		<div class="form-group">
			<label><strong>{{localize(`${ModuleID}.configure.settings.maximum.name`)}}</strong></label>
			<div class="form-fields">
				<input type="number" v-model="faction.max" :min="faction.min" :step="faction.step" :disabled="!overrideSettings && !isGlobal">
			</div>
			<p class="notes">{{localize(`${ModuleID}.configure.settings.maximum.hint`)}}</p>
		</div>
		<div class="form-group">
			<label><strong>{{localize(`${ModuleID}.configure.settings.default.name`)}}</strong></label>
			<div class="form-fields">
				<input type="number" v-model="faction.default" :min="faction.min" :max="faction.max" :step="faction.step" @change="faction.value = faction.default" :disabled="!overrideSettings && !isGlobal">
			</div>
			<p class="notes">{{localize(`${ModuleID}.configure.settings.default.hint`)}}</p>
		</div>
		<div class="form-group">
            <label><strong>{{localize(`${ModuleID}.configure.settings.colorize.name`)}}</strong></label>
            <div class="form-fields">
                <input type="checkbox" :v-model="faction.colorize" :checked="faction.colorize" @change="onChangeColorize" :disabled="!overrideSettings && !isGlobal">
            </div>
			<p class="notes">{{localize(`${ModuleID}.configure.settings.colorize.hint`)}}</p>
		</div>
	</section>
	<h3>{{localize(`${ModuleID}.configure.tiers.title`)}}</h3>
	<section class="tiers">
		<ul>
			<li class="header">
				<div class="form-group">
					<div class="form-fields">
						<input type="text" value="<=" readonly disabled>
						<input type="text" :value="localize(`${ModuleID}.configure.tiers.headingLabel`)" readonly disabled>
					</div>
				</div>
			</li>
			<li v-for="(tiers, fIdx) in faction.tiers" :data-tier="fIdx">
				<div class="form-group">
					<div class="form-fields">
						<input type="number" :value="tiers[0]" :min="faction.min" :max="faction.max" :step="faction.step" @blur="onUpdateTier" :disabled="!overrideSettings && !isGlobal">
						<input type="text" v-model="tiers[1]" :disabled="!overrideSettings && !isGlobal">
						<button v-if="overrideSettings || isGlobal" :data-tooltip="localize('Delete')" @click="onRemoveTier" :disabled="!overrideSettings && !isGlobal"><i class="fa-regular fa-trash-can-xmark"></i></button>
					</div>
				</div>
			</li>
			<li v-if="overrideSettings || isGlobal">
				<div class="form-group">
					<div class="form-fields">
						<input type="number" :value="faction.value" :min="faction.min" :max="faction.max" :step="faction.step">
						<input type="text" :placeholder="localize(`${ModuleID}.configure.tiers.addTierLabel`)">
						<button @click="onAddTier"><i class="fa-solid fa-floppy-disk"></i></button>
					</div>
				</div>
			</li>
		</ul>
	</section>
	<footer>
		<button type="submit" :data-tooltip="(faction.preset !== 'globalDefaults' && isGlobal) ? localize(`${ModuleID}.configure.tooltips.overrideGlobalDefaults`) : ''" @click="onSubmit"><i class="fas fa-save"></i> {{localize('Save Changes')}}</button>
	</footer>
</main>