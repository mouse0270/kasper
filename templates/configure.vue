<main>
	<header><h2>{{store.title()}}</h2></header>
	<h3>{{game.i18n.localize('Preview')}}</h3>
	<section class="preview">
		<ul>
			<li :id="`${store.ID}.Preview`">
				<div class="form-group" :data-is-colorized="store.faction.colorize" :style="store.getStyle(store.faction, $el)">
					<label for="faction">{{l(`${store.ID}.reputation.faction.title`)}}</label>
					<input type="range" v-model="store.faction.value" :min="store.faction.min" :max="store.faction.max" step="store.faction.step" @change="store.onReputationChange(store.faction, $event, null)">
					<p class="notes">{{store.getLabel(store.faction)}} ({{store.faction.value}})</p>
				</div>
				<button data-action="decrease-reputation" :data-tooltip="l(`${store.ID}.manager.decreaseReputation`)" @click="store.onReputationChange(store.faction, $event, 'decrease')"><i class="fa-regular fa-circle-minus"></i></button>
				<button data-action="increase-reputation" :data-tooltip="l(`${store.ID}.manager.increaseReputation`)" @click="store.onReputationChange(store.faction, $event, 'increase')"><i class="fa-regular fa-circle-plus"></i></button>
			</li>
		</ul>
	</section>
	<h3>{{localize(`${store.ID}.configure.settings.title`)}}</h3>
	<section v-model="store.showSettings">
		<div class="form-group" v-if="!store.isGlobal">
            <label><strong>{{localize(`${store.ID}.configure.settings.override.name`)}}</strong></label>
            <div class="form-fields">
                 <input type="checkbox" :v-model="store.showSettings" :checked="store.showSettings" @change="store.showSettingsToggle($event, store)">
            </div>
			<p class="notes">{{localize(`${store.ID}.configure.settings.override.hint`)}}</p>
		</div>
		<div class="form-group" v-if="store.showSettings || store.isGlobal">
			<label><strong>{{localize(`${store.ID}.configure.settings.minimum.name`)}}</strong></label>
			<div class="form-fields">
				<input type="number" v-model="store.faction.min" :max="store.faction.max" :step="store.faction.step">
			</div>
			<p class="notes">{{localize(`${store.ID}.configure.settings.minimum.hint`)}}</p>
		</div>
		<div class="form-group" v-if="store.showSettings || store.isGlobal">
			<label><strong>{{localize(`${store.ID}.configure.settings.maximum.name`)}}</strong></label>
			<div class="form-fields">
				<input type="number" v-model="store.faction.max" :min="store.faction.min" :step="store.faction.step">
			</div>
			<p class="notes">{{localize(`${store.ID}.configure.settings.maximum.hint`)}}</p>
		</div>
		<div class="form-group" v-if="store.showSettings || store.isGlobal">
			<label><strong>{{localize(`${store.ID}.configure.settings.default.name`)}}</strong></label>
			<div class="form-fields">
				<input type="number" v-model="store.faction.default" :min="store.faction.min" :max="store.faction.max" :step="store.faction.step" @change="store.faction.value = store.faction.default">
			</div>
			<p class="notes">{{localize(`${store.ID}.configure.settings.default.hint`)}}</p>
		</div>
		<div class="form-group" v-if="store.showSettings || store.isGlobal">
            <label><strong>{{localize(`${store.ID}.configure.settings.colorize.name`)}}</strong></label>
            <div class="form-fields">
                <input type="checkbox" :v-model="store.faction.colorize" :checked="store.faction.colorize" @change="store.updateColorize(store.faction, $event)">
            </div>
			<p class="notes">{{localize(`${store.ID}.configure.settings.colorize.hint`)}}</p>
		</div>
	</section>
	<h3 v-if="store.showSettings || store.isGlobal">{{localize(`${store.ID}.configure.tiers.title`)}}</h3>
	<section class="tiers" v-if="store.showSettings || store.isGlobal">
		<ul>
			<li class="header">
				<div class="form-group">
					<div class="form-fields">
						<input type="text" value="<=" readonly disabled>
						<input type="text" :value="localize(`${store.ID}.configure.tiers.headingLabel`)" readonly disabled>
					</div>
				</div>
			</li>
			<li v-for="(tiers, fIdx) in store.faction.tiers" :data-tier="fIdx">
				<div class="form-group">
					<div class="form-fields">
						<input type="number" :value="tiers[0]" :min="store.faction.min" :max="store.faction.max" :step="store.faction.step" @blur="store.onUpdateTier($event, store.faction, fIdx)">
						<input type="text" v-model="tiers[1]">
						<button @click="store.onRemoveTier($event, store.faction, fIdx)"><i class="fa-regular fa-trash-can-xmark"></i></button>
					</div>
				</div>
			</li>
			<li>
				<div class="form-group">
					<div class="form-fields">
						<input type="number" :value="store.faction.value" :min="store.faction.min" :max="store.faction.max" :step="store.faction.step">
						<input type="text" :placeholder="localize(`${store.ID}.configure.tiers.addTierLabel`)">
						<button @click="store.onAddTier($event, store.faction)"><i class="fa-solid fa-floppy-disk"></i></button>
					</div>
				</div>
			</li>
	</section>
	<footer>
		<button type="submit" @click="store.SaveConfig($event, store.faction)"><i class="fas fa-save"></i> {{game.i18n.localize('Save Changes')}}</button>
	</footer>
</main>