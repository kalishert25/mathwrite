<script lang="ts">
  let {
    name = "",
    kind = "file",
    nestingLevel = 0,
    isHidden = false,
    isCollapsed = false,
    onclick,
  } = $props();
</script>

{#if !isHidden}
  <button
    class=" flex h-7 w-full min-w-0 flex-row items-center gap-3 pl-5 pr-2 hover:bg-stone-700"
    {onclick}>
    {#each { length: nestingLevel } as _, i}
      <div
        class="h-7 w-[0.49rem;] shrink-0 border-r-[0.07rem] border-stone-600">
      </div>
    {/each}
    {#if kind == "directory"}
      {#if isCollapsed}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="#57534E"
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
          stroke="#57534E"
          class="mb-[-.1rem;] size-3.5 shrink-0">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      {/if}

      <div class="overflow-hidden whitespace-nowrap text-ellipsis">
        {name}
      </div>
    {:else}
      <div class="overflow-hidden whitespace-nowrap text-ellipsis pl-[1.625rem]">
        {name}
      </div>
    {/if}
  </button>
{/if}
