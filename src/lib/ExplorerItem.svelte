<script lang="ts">
  let {
    name = "",
    kind = "file",
    nestingLevel = 0,
    isHidden = false,
    isCollapsed = false,
    isSelected = false,
    isRenamable = false,
    onclick,
  } = $props();
</script>

{#if !isHidden}
  <button
    class={`border-b-2 border-stone-800 border-collapse flex h-7 w-full min-w-0 flex-row items-center gap-3 pl-2 pr-2 hover:bg-stone-700 ${isSelected ? "bg-stone-700" : ""}` }
    {onclick}>
    {#each { length: nestingLevel } as _, i}
      <div
        class="h-7 w-[0.49rem;] shrink-0 border-r-[0.07rem] border-stone-600">
      </div>
    {/each}
    
      <span class={kind=="directory" ? "text-stone-600" : "invisible"}>
        {#if isCollapsed}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="mb-[-.1rem;] size-3.5 shrink-0">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width={2}
          stroke="currentColor"
          class="mb-[-.1rem;] size-3.5 shrink-0">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      {/if}
      </span>
      

      <div class="overflow-hidden whitespace-nowrap text-ellipsis">
        {name}
      </div>
      
      <!-- <div class="overflow-hidden whitespace-nowrap text-ellipsis pl-[1.625rem]">
        {name}
      </div> -->
   
  </button>
{/if}
