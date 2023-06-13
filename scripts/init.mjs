// GET MODULE FUNCTIONS
import { MODULE } from './_module.mjs';

// GET CORE MODULE
import { default as CORE } from './module.mjs';

import { Configure } from './dialogs/configure.mjs';

/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
// socketlib HOOKS -> socketlib.ready
/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
Hooks.once('socketlib.ready', () => {
	MODULE.log('debug', 'SOCKETLIB Ready - SOCKET'); // WONT REGISTER CAUSE CALL HAPPENS WAY TO EARLY
	CORE.registerSocketLib();
});

/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
// FOUNDRY HOOKS -> READY
/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
Hooks.once('init', async () => {
	CORE.init();
});
Hooks.once('ready', async () => {});

/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
// FOUNDRY HOOKS -> MODULE FUNCTIONS
/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
// Update Actor if Actor is updated outside of Reputation Tracker
Hooks.on('updateActor', CORE.updateItem);
Hooks.on('deleteActor', CORE.deleteItem);

// Update Journal if Journal is updated outside of Reputation Tracker
Hooks.on('updateJournalEntry', CORE.updateItem);
Hooks.on('deleteJournalEntry', CORE.deleteItem);

// Add Button || Pin to Journal Tab
Hooks.on('renderSidebarTab', CORE.renderSidebarTab);