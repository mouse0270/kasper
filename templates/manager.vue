<main :class="ModuleID">
	<div class="sortablejs-reputation">
		<template v-for="(reputation, rIdx) in reputations" :key="rIdx">
			<section v-if="(userIsGM || (reputation?.viewable ?? false))" :id="reputation.uuid"
				:class="[ `${ModuleID}-faction-container`, { 'player-can-see': reputation?.viewable ?? false } ]"
				:key="reputation.uuid">
				<header>
					<button v-if="userIsGM" data-action="sortable"
						:data-tooltip="localize(`${ModuleID}.manager.sortable`)"
						@click="(event) => { event.preventDefault(); }"><i
							class="sortablejs-handle fa-solid fa-grip-vertical"></i></button>
					<div>
						<i v-if="userIsGM && reputation?.altTitle" class="fa-regular fa-masks-theater" :data-tooltip="reputation.altTitle"></i>
						<h1 :data-tooltip="reputation.name.length > 15 ? reputation.name : null"
							:contenteditable="(reputation?.docUuid?.startsWith(`${ModuleID}.`) ?? userIsGM) && userIsGM"
							@keydown="onContentEditableKeydown" @blur="onNameChange">{{userIsGM ? reputation.name : reputation?.altTitle ?? reputation.name}}</h1>
					</div>
					<button v-if="userIsGM" data-action="add-faction"
						:data-tooltip="localize(`${ModuleID}.manager.addFaction`)" @click="addFaction"><i
							class="fa-regular fa-circle-plus"></i></button>
				</header>
				<ul>
					<template v-for="(faction, fIdx) in reputation.factions" :key="fIdx">
						<li v-if="(userIsGM || (faction?.viewable ?? false))" :id="faction.uuid" :key="faction.uuid">
							<button v-if="userIsGM" data-action="sortable"
								:data-tooltip="localize(`${ModuleID}.manager.sortable`)"
								@click="(event) => { event.preventDefault(); }"><i
									class="sortablejs-handle fa-solid fa-grip-vertical"></i></button>
							<button v-if="userIsGM" data-action="decrease"
								:data-tooltip="localize(`${ModuleID}.manager.decreaseReputation`)"
								@click="onReputationChange"><i class="fa-regular fa-circle-minus"></i></button>
							<div class="form-group" :style="getStyle(reputation, faction, $el)">
								<div>
									<i v-if="userIsGM && faction?.altTitle" class="fa-regular fa-masks-theater" :data-tooltip="faction.altTitle"></i>
									<label for="faction" :data-tooltip="faction.name.length > 20 ? faction.name : null"
										:contenteditable="(faction?.docUuid?.startsWith(`${ModuleID}.`) ?? userIsGM) && userIsGM"
										@keydown="onContentEditableKeydown" @blur="onNameChange">{{userIsGM ? faction.name : faction?.altTitle ?? faction.name}}</label>
								</div>
								<input type="range" v-model="faction.reputation"
									:min="getSettings(reputation, faction).min"
									:max="getSettings(reputation, faction).max"
									step="getSettings(reputation, faction).step" :disabled="!userIsGM"
									@change="onReputationChange" @wheel="onInputRangeWheel">
								<p class="notes">{{getLabel(reputation, faction)}} ({{faction.reputation}})</p>
							</div>
							<button v-if="userIsGM" data-action="increase"
								:data-tooltip="localize(`${ModuleID}.manager.increaseReputation`)"
								@click="onReputationChange"><i class="fa-regular fa-circle-plus"></i></button>
						</li>
					</template>
				</ul>
			</section>
		</template>
	</div>

	<div v-if="userIsGM" class="action-buttons">
		<button data-action="add-reputation" @click="createReputation"><i class="fa-regular fa-circle-plus"></i>
			{{localize(`${ModuleID}.manager.addFaction`)}}</button>
	</div>
</main>