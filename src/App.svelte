<script lang="ts">
	import type { GameDataType } from "src/Entities";
	import Achievements from "src/tabs/Achievements.svelte";
	import GoneFishing from "src/tabs/GoneFishing.svelte";
	import Shop from "src/tabs/Shop.svelte";
	import Skills from "src/tabs/Skills.svelte";
	import Settings from "src/tabs/Settings.svelte";

	import {calculatedAge, createData, loadGameData, saveGameData, update, togglePause} from "./functions";
	import {boatBaseData, fishBaseData, GameData, itemBaseData, skillBaseData} from "./gameData";
	import {onMount } from "svelte";
	

	type Tab = "goneFishing" | "skills" | "shop" | "achievements" | "settings";
	let selectedTab: Tab = "goneFishing";
	let gameData: GameDataType = GameData;
	
	
	onMount(() => {
	})
	
	const updateGame = () => {
		gameData = GameData;
		if(!gameData.paused){
			update()
		}
	}
	const masterInterval: number = window.setInterval(updateGame, 1000)
	const saveInterval: number = window.setInterval(saveGameData, 3000)
	
	const selectTab = (selected: Tab) => {
		selectedTab = selected;
	}

	createData(gameData.fishingData, fishBaseData)
	createData(gameData.skillsData, skillBaseData)
	createData(gameData.itemData, itemBaseData) 
	createData(gameData.boatData, boatBaseData)
	
	loadGameData();
	
	
	GameData.currentlyFishing = GameData.fishingData["blackDrum"];
	GameData.currentSkill = GameData.skillsData["Concentration"];
	GameData.currentProperty = GameData.itemData["Homeless"];
	GameData.currentMisc = [];
	
	GameData.requirements = new Map();
</script>

<main>
	<h1 class="text-6xl">Idle Fishing</h1>
	<div class="flex flex-row">
		<div class="flex flex-col w-1/4">
			<div class="m-3 flex">
				<p class="text-lg">{calculatedAge(gameData.day)}</p>
			</div>
			<div class="m-3 flex flex-col">
				<button class="px-9 py-4 bg-gray-700 hover:bg-gray-800 text-white" on:click={togglePause}>{gameData.paused ? "Play" : "Pause"}</button>
			</div>
			<div class="m-3 flex flex-col">
				<p class="text-lg">Coins</p>
				<span class="flex">
					<p class="text-lg text-yellow-400">{0}g</p>
					<p class="text-lg text-gray-400">{0}s</p>
					<p class="text-lg text-yellow-800">{0}c</p>
				</span>
			</div>
				
		</div>

		<div class="flex flex-col mr-2 w-3/4 overflow-x-auto">

			<div class="flex flex-row bg-gray-800 text-white p-5">
				<div class="flex flex-row justify-between w-2/3">
					<button on:click={() => selectTab("skills")}>Skills</button>
					<button on:click={() => selectTab("goneFishing")}>Gone Fishing</button>
					<button on:click={() => selectTab("achievements")}>Achievements</button>
					<button on:click={() => selectTab("shop")}>Shop</button>
				</div>
				<div class="flex justify-end w-1/3" >
					<button on:click={() => selectTab("settings")}>Settings</button>	
				</div>
			</div>

			<div class="flex flex-col">
				{#if selectedTab == "skills"}
					<Skills gameData={{...gameData}}/>
				{:else if selectedTab == "goneFishing"}
					<GoneFishing gameData={{...gameData}}/>
				{:else if selectedTab == "achievements"}
					<Achievements gameData={{...gameData}}/>
				{:else if selectedTab == "shop"}
					<Shop gameData={{...gameData}}/>
				{:else}
					<Settings gameData={{...gameData}}/>
				{/if}
			</div>
			
		</div>


	</div>
</main>

<style global lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;

	tr:nth-child(even){background-color: #f2f2f2;}
	tr:nth-child(odd){background-color: #eee;}

	tr:hover {background-color: #ddd;}
	

</style>