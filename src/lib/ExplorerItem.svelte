<script lang="ts">
  import { onMount } from "svelte";

  let {
    name = "",
    kind = "file",
    nestingLevel = 0,
    isHidden = false,
    isCollapsed = false,
    isSelected = false,
    isRenamable = false,
    onclick,
    onrename,
  } = $props();
  let renamedValue = $state(name);
  let inputElement: HTMLInputElement | undefined = $state();
  const enterHandler = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      onrename(renamedValue);
    }
  };
  onMount(() => {
    if (isRenamable) {
      inputElement?.focus();
      inputElement?.select();

      inputElement?.addEventListener("keydown", enterHandler);
    }
    return () => {
      inputElement?.removeEventListener("keydown", enterHandler);
    };
  });
</script>

{#if !isHidden}
  <button
    class={` shrink-0 flex h-7 w-full min-w-0 border-collapse flex-row items-center gap-3 pl-2 pr-2 hover:bg-stone-700 has-[:focus]:border has-[:focus]:border-blue-400 ${isSelected ? "bg-stone-700" : ""}`}
    {onclick}>
    {#each { length: nestingLevel } as _, i}
      <div
        class="h-7 w-[0.49rem;] shrink-0 border-r-[0.07rem] border-stone-600">
      </div>
    {/each}

    <span class={kind == "directory" ? "text-stone-600" : "invisible"}>
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

    {#if isRenamable}
      <input
        onblur={() => {
          onrename(renamedValue);
        }}
        bind:value={renamedValue}
        bind:this={inputElement}
        placeholder="Name"
        class="h-full border-none bg-inherit p-0 focus:ring-0" />
    {:else}
      <div
        class="overflow-hidden text-ellipsis whitespace-nowrap text-stone-300">
        {name}
      </div>
    {/if}

    <!-- <div class="overflow-hidden whitespace-nowrap text-ellipsis pl-[1.625rem]">
        {name}
      </div> -->
  </button>
{/if}
