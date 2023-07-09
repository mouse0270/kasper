# Version 1.1.2 - The Ghost of Foundry VTT v10 Strikes Back
- Fixed an issue when registering a game setting in v10 using `game.user.isGM`
- Fixed an issue with v10 Foundry VTT ContextMenu expecting a jQuery object instead of a HTMLElement

# Version 1.1.0 - B...........OOOOO, Did I scare you?
- Ajusted the Generic Presets Labels from
  - Infamous to Loathed
  - Exalted to Despised
  - Feared to Scorned
- Fixed a duplicate line in the Readme.md file
- Fixed Firefox not Stlying Range Inputs correctly
- Added Option to Show/Hide Trackers to Players
- Added Preset for PF2e Reputation found on *Gamemastery Guide p.164*
- Added Support for libThemer and PF2e Dorako UI - Dark Theme (Buttons for Header when hovered well slightly overlap border... I work on this later).
- Added the ability to quickly override the Global Defaults with a preset. When editing presets, if you hold down `SHIFT` and click on the *Save Changes* Button, you will be prompted to override the Global Defaults with whatever settings are current selected. This is useful, if you want to quickly set Pathfinder 2e Reputations as the Global Defaults.
- Added the ability to hold `shift` while pressing the increase/decrease buttons to increase/decrease by 5 instead of 1
- Disabled wheel scrolling over range inputs from changing value unless holding down `ctrl` key. This is to prevent accidental changes to the value when scrolling through the page.
  - Holding `ctrl + shift` well scrolling will increase/decrease by 5 instead of 1
> If using [Disable Mouse Wheel Control for Sliders](https://foundryvtt.com/packages/disable-mouse-wheel-sliders) Module, this setting will be ignored and instead use that moudes keybinds. Please be aware if you use `shift` as the Escape key for this module, you will not be able to increment/decrement by a value of one and instead will always increment/decrement by 5. I HIGHLY suggest you use ctrl or alt as your escape key for that module when using KASPER.
- Added `text-shadow` to Label when using minify mode to make it easier to read (This is a temporary fix until I can figure out a better fix).

# Version 1.0.0 - A Wild Ghost Appears, and so does KASPER
Introducing KASPER: The Ultimate Karma and Player Evaluation Resource

Welcome to KASPER, the groundbreaking solution designed to empower Game Masters with seamless player reputation tracking in relation to NPCs, Factions, Organizations, and more. With its unparalleled versatility and advanced features, KASPER revolutionizes the way you manage and monitor player dynamics.

Elevate your gaming experience with KASPER's highly configurable Tiered Ranking system, providing you with a powerful tool to effortlessly create and monitor various aspects of player interactions. Whether it's measuring a player's relationship with an NPC or tracking their prestigious rank within different Factions, KASPER is equipped to handle it all. From X to Y, there's no limit to what KASPER can track.

Here's why you should be using KASPER:
* Streamlined Reputation Tracking: Say goodbye to manual note-taking and tedious spreadsheets. KASPER streamlines the process, allowing you to easily record and manage player reputations across multiple entities.
* Streamlined Reputation Tracking: Say goodbye to manual note-taking and tedious spreadsheets. KASPER streamlines the process, allowing you to easily record and manage player reputations across multiple entities.
* *Ghostly Encounters: If you're a fan of the supernatural and yearn for ghostly encounters in your Foundry VTT instance, KASPER has you covered. Harnessing its mystical powers, KASPER can conjure ethereal spirits and weave them seamlessly into your gaming sessions. Get ready for spine-tingling adventures like never before!*

Unlock the true potential of player evaluation and enhance the depth of your storytelling with KASPER. Say goodbye to ambiguity and hello to precise tracking, empowering you to create unforgettable gaming experiences. Get started today and witness the transformative power of KASPER!

> ! Disclaimer: KASPER is not responsible for any supernatural encounters that may occur as a result of using this module. Use at your own risk.