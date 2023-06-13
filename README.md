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
![image](https://github.com/mouse0270/kasper/assets/564874/430c22a5-b503-4a07-8f29-e382a2135a4e)

KASPER is a Karma and Player Evaluation Resource. It was designed to allow Game Masters to easily track players reputations related to NPCs, Factions, Organizations or really anything. Its highly configurable Tiered Ranking system allows you to quickly create and track anything from a players relation to another NPC, to their Rank in individual Factions. If it can be put on a scale from X to Y, than KASPER can track it. 

Here's why you should be using KASPER:
* If you need to track your groups reputation with NPCs, Factions, Organizations or anything else, KASPER can do it.
* If you need to track players ranks in Factions, Organizations or anything else, KASPER can do it.
* If you like Ghosts and want to see a Ghost in your Foundry VTT instance, KASPER can do it.

### How to use
KASPER allows you to create generic items to track using the provided UI, however you can currently Drag Actors or Journal Entries onto the KASPER UI to create a new item. If you drag a folder onto the UI, it will create a new Reputation tracker with each document in the folder. **HOWEVER** It will only work with documents directly in the folder, not subfolders.

You can customize the labels and values used in KASPER by right clicking on the option you want to customize and select configure. Otherwise you can use the default values. Right clicking will also allow you to delete Sections and Factions.


#### TODO
- [ ] Add Option to Select, Create, Export and Import Configuration Templates to allow users to share their KASPER Reputation Configurations
- [ ] Develop API to allow other modules to interact with KASPER
- [ ] Allow users to drag and drop items inside the KASPER UI to allow them to sort and reorganize items, currently its sorted by when it was added to kasper
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
