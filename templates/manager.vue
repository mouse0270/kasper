<main :class="store.ID">
	<div class="sortablejs-reputation">
		<section :class="`${store.ID}-faction-container`" v-for="(reputation, rIdex) in store.reputations" :id="reputation.uuid" :key="reputation.uuid">
			<header>
				<button data-action="sortable" :data-tooltip="l(`${store.ID}.manager.sortable`)" @click="(event) => { event.preventDefault(); }"><i class="sortablejs-handle fa-solid fa-grip-vertical"></i></button>
				<h1 :contenteditable="(reputation?.docUuid?.startsWith(`${store.ID}.`) ?? game.user.isGM) && game.user.isGM" @keydown="store.onContentEditableKeydown($event)" @blur="store.onRepuationNameChange(reputation, $event, store)">{{reputation.name}}</h1>
				<button data-action="add-faction" :data-tooltip="l(`${store.ID}.manager.addFaction`)" @click="store.addFaction(reputation, store)"><i class="fa-regular fa-circle-plus"></i></button>
			</header>
			<ul>
				<li v-for="(faction, fIdx) in reputation.factions" :id="faction.uuid" :key="faction.uuid">
					<button data-action="sortable" :data-tooltip="l(`${store.ID}.manager.sortable`)" @click="(event) => { event.preventDefault(); }"><i class="sortablejs-handle fa-solid fa-grip-vertical"></i></button>
					<button data-action="decrease-reputation" :data-tooltip="l(`${store.ID}.manager.decreaseReputation`)" @click="store.onReputationChange(store.getSettings(reputation, faction), faction, 'decrease', store)"><i class="fa-regular fa-circle-minus"></i></button>
					<div class="form-group" :style="store.getStyle(reputation, faction, $el)">
						<label for="faction" :data-tooltip="faction.name.length > 20 ? faction.name : null" :contenteditable="(faction?.docUuid?.startsWith(`${store.ID}.`) ?? game.user.isGM) && game.user.isGM" @keydown="store.onContentEditableKeydown($event)" @blur="store.onFactionNameChange(reputation, faction, $event, store)">{{faction.name}}</label>
						<input type="range" v-model="faction.reputation" :value="faction.reputation" :min="store.getSettings(reputation, faction).min" :max="store.getSettings(reputation, faction).max" step="store.getSettings(reputation, faction).step" @change="store.onReputationChange(store.getSettings(reputation, faction), faction, $event, store)">
						<p class="notes">{{store.getLabel(reputation, faction)}} ({{faction.reputation}})</p>
					</div>
					<button data-action="increase-reputation" :data-tooltip="l(`${store.ID}.manager.increaseReputation`)" @click="store.onReputationChange(store.getSettings(reputation, faction), faction, 'increase', store)"><i class="fa-regular fa-circle-plus"></i></button>
				</li>
			</ul>
		</section>
	</div>

	<div class="action-buttons">
		<button data-action="add-reputation" @click="store.addReputation"><i class="fa-regular fa-circle-plus"></i> {{l(`${store.ID}.manager.addFaction`)}}</button>
	</div>
</main>