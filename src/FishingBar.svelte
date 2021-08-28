<script lang="ts">
    export let type: string;
    export let level: number;
    export let effect: number;
    export let xpPerDay: number;
    export let xpLeft: number;
    export let maxLevel: number;
    export let selectedFish: string;
    export let selectFish;
    export let xpNeeded: number;
    let fishPerDay: number;

    const gainXp = () => {
        
    }

    if(selectedFish == type){
        gainXp();
    }
</script>

<div class="mt-2 w-full" on:click={() => selectFish(type)}>

    <div class="bar-container">
        <div class="bar">
            <div class="text-top">
                {type}
            </div>
            <div class="progress" style="width: {(xpNeeded-xpLeft)/xpNeeded * 100}%; height: 100%;">
            </div>
        </div>
        <p>Level: {level}</p>
        <p>Effect: {effect}</p>
        <p>Left: {xpLeft}</p>
        <p>xp/day: {xpPerDay}</p>
        <p>Max Level: {maxLevel}</p>
    </div>
</div>

<style>
    .bar{
        position: relative;
        width: 300px;
        color: white;
        background-color: #5534ff;
    }
    .progress {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
        background-color: #998833;
    }
    .text-top{
        position:absolute;
        z-index: 3;
    }
    .bar-container{
        display: flex;
        justify-content: space-between;
    }
</style>