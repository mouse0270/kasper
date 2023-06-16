<a name="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Forge][forge-installs]][forge-url]
[![Downloads][latest-download]][latest-download-url]
[![GithubStars][github-starts]][github-url]
[![Patreon][patreon]][patreon-url]
[![Kofi][ko-fi]][ko-fi-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
	<!-- Would like to have an animated Ghost Gif but legally couldn't find one to use -->
	<a href="https://github.com/mouse0270/kasper">
		<img src="./assets/logo.gif" alt="Logo" width="128" height="128" />
	</a>

<h3 align="center">KASPER<h4 align="center">Karma Assessment and Player Evaluation Resource</h4></h3>

  
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
	<ol>
		<li><a href="#about-the-Module">About the Module</a></li>
		<li><a href="#supported-Modules--Systems">Supported Modules / Systems</a></li>
		<li><a href="#license">License</a></li>
		<li><a href="#acknowledgments">Acknowledgments</a></li>
	</ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Module
![kasper-header](https://github.com/mouse0270/kasper/assets/564874/9e5ecd38-0db3-4a20-bcc8-749b913fb698)

Introducing KASPER: The Ultimate Karma and Player Evaluation Resource

Welcome to KASPER, the groundbreaking solution designed to empower Game Masters with seamless player reputation tracking in relation to NPCs, Factions, Organizations, and more. With its unparalleled versatility and advanced features, KASPER revolutionizes the way you manage and monitor player dynamics.

Elevate your gaming experience with KASPER's highly configurable Tiered Ranking system, providing you with a powerful tool to effortlessly create and monitor various aspects of player interactions. Whether it's measuring a player's relationship with an NPC or tracking their prestigious rank within different Factions, KASPER is equipped to handle it all. From X to Y, there's no limit to what KASPER can track.

Here's why you should be using KASPER:
* Streamlined Reputation Tracking: Say goodbye to manual note-taking and tedious spreadsheets. KASPER streamlines the process, allowing you to easily record and manage player reputations across multiple entities.
* Unleash Your Creativity: With KASPER's flexible configuration options, you have the freedom to tailor the system to your specific game world. Create unique scales and rankings that align with the intricacies of your narrative.
* *Ghostly Encounters: If you're a fan of the supernatural and yearn for ghostly encounters in your Foundry VTT instance, KASPER has you covered. Harnessing its mystical powers, KASPER can conjure ethereal spirits and weave them seamlessly into your gaming sessions. Get ready for spine-tingling adventures like never before!*

Unlock the true potential of player evaluation and enhance the depth of your storytelling with KASPER. Say goodbye to ambiguity and hello to precise tracking, empowering you to create unforgettable gaming experiences. Get started today and witness the transformative power of KASPER!

> Note: This project is new, and I welcome your feedback to make KASPER even better. Let's shape the future of player evaluation together!

> ! Disclaimer: KASPER is not responsible for any supernatural encounters that may occur as a result of using this module. Use at your own risk.

### How to use
KASPER allows you to create generic items to track using the provided UI, however you can currently Drag Actors or Journal Entries onto the KASPER UI to create a new item. If you drag a folder onto the UI, it will create a new Reputation tracker with each document in the folder. **HOWEVER** It will only work with documents directly in the folder, not subfolders.

You can customize the labels and values used in KASPER by right clicking on the option you want to customize and select configure. Otherwise you can use the default values. Right clicking will also allow you to delete Sections and Factions.


#### TODO
- [ ] Add Option to Select, Create, Export and Import Configuration Templates to allow users to share their KASPER Reputation Configurations
- [ ] Develop API to allow other modules to interact with KASPER
- [ ] Add Keyboard Accessible Support for Sorting items
- [ ] Provide a visual indicator that Section or Faction is linked to a document in Foundry.
  - Currently linked documents are only distinguished by the fact that their titles can not be edited within KASPER
- [ ] Propbably other stuff I forgot about...

> Please note as of June 13 2023, KASPER was designed in about 2 days. It a working project but has not be thouroughly tested. Please report any bugs you find.


<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- SUPPORTED MODULES/SYSTEMS -->
## Supported Modules / Systems
None right now, But I'd like to be able to integrate into other modules like FQL so that when you status in a quest changes, you can automate the change in a players reputation with NPCs, Factions, Organizations or anything else


<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License
Distributed under the MIT License. See [LICENSE]([license-url]) for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments
The Animated Ghost used is from the Noto Color Emoji font by Google [License](https://fonts.google.com/noto/specimen/Noto+Color+Emoji/about)


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[license-url]: https://github.com/mouse0270/kasper/blob/master/LICENSE

[forge-installs]: https://img.shields.io/badge/dynamic/json?&colorB=90A959&label=Forge%20Installs&query=package.installs&suffix=%25&style=for-the-badge&url=https://forge-vtt.com/api/bazaar/package/kasper
[forge-url]: https://forge-vtt.com/bazaar/package/kasper

[latest-download]: https://img.shields.io/github/downloads/mouse0270/kasper/latest/module.zip?color=5D4A66&label=DOWNLOADS&style=for-the-badge
[latest-download-url]: https://github.com/mouse0270/kasper/releases/latest

[github-starts]: https://img.shields.io/github/stars/mouse0270/kasper?logo=AddThis&logoColor=white&style=for-the-badge
[github-url]: https://github.com/mouse0270/kasper

[patreon]: https://img.shields.io/badge/-Patreon-FF424D?style=for-the-badge&logo=Patreon&logoColor=white
[patreon-url]: https://www.patreon.com/mouse0270

[ko-fi]: https://img.shields.io/badge/-ko%20fi-FF5E5B?style=for-the-badge&logo=Ko-fi&logoColor=white
[ko-fi-url]: https://ko-fi.com/mouse0270
