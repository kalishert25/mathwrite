<script lang="ts">
  import UndoRedo from "./UndoRedo.svelte";
  import { onMount } from "svelte";
  import MathInput from "./MathInput.svelte";
  import type { MathField } from "mathquill-node";
  

  let selectedLine = $state(-1);
  let keyNum = $state(0);
  let { fileSystemHandle } = $props();
  interface FileLine {
    id: number;
    value: string;
  }
  let fileLines: FileLine[] = $state([]);

  const readFile = async (fileSystemHandle: FileSystemFileHandle) => {
    const fileContent = await (await fileSystemHandle.getFile()).text();
    const lines = fileContent.split(/\r?\n/);

    // Extract and return strings matching the $$string$$ format
    const res: FileLine[] = lines
      .map((line: string, index: number) => {
        const match = /^\$\$(.*?)\$\$$/.exec(line.trim());
        return {id:index, value:match ? match[1] : null} as FileLine; // Capture the string within $$...$$
      })
      .filter(fl => fl.value != null); // Remove nulls (lines that didn't match)
    console.log(res);
    return res;
  };
  function handleOutsideClick(ev: MouseEvent) {
    let target = ev?.target as HTMLElement;
    if (!target.closest("button") && !target.closest("a")) {
      selectedLine = -1;
    }
  }
  $effect(() => {
    readFile(fileSystemHandle).then((lines) => {
      fileLines = lines
      if (fileLines.length == 0) {
        fileLines = [{
          id: 0,
          value: "",
        }]
      }
      keyNum = fileLines.length // prevent duplicate keys
      
    })
  })

  onMount(() => {
    
    
    document.body.addEventListener("mousedown", handleOutsideClick, true);
    return () => {
      document.body.removeEventListener("mousedown", handleOutsideClick, true);
    };
  });
  $effect(() => {
    if (selectedLine < 0) return;

    const mf = document.querySelector(
      `#mathline-${selectedLine} textarea`,
    ) as unknown as MathField;
    mf.focus();

    return () => {
      mf.blur();
    };
  });
  function newLine() {
    fileLines.push({
      id: keyNum,
      value: "",
    });
    keyNum++;
  }
  function prevLine() {
    selectedLine = Math.max(selectedLine - 1, 0);
  }
  function nextLine() {
    selectedLine = Math.min(selectedLine + 1, fileLines.length - 1);
  }
  function handleEnter() {
    if (selectedLine >= fileLines.length - 1) {
      newLine();
    }
    nextLine();
  }
  const removeLine = (index: number) => {
    if (selectedLine == index) {
      prevLine();
    }

    if (fileLines.length <= 1) {
      return;
    }

    console.log("removing index " + index);
    console.log(index);
    console.log(fileLines);
    fileLines = fileLines.filter((v, i) => i != index);
  };

  readFile(fileSystemHandle);
</script>

<div
  class="mx-auto flex h-full min-h-screen w-full justify-center px-10 pt-10 text-lg md:w-3/4">
  <div class="flex w-full flex-col gap-3">
    <h1 class="bold pb-6 text-[2rem]">File: {fileSystemHandle.name}</h1>
    <UndoRedo />

    {#each fileLines as line, index (line.id)}
      <MathInput
        onclick={() => (selectedLine = index)}
        {index}
        bind:value={fileLines[index].value}
        deleteMe={() => {
          removeLine(index);
        }}
        upOutOf={prevLine}
        downOutOf={nextLine}
        enter={handleEnter}
        isFocused={index == selectedLine} />
    {/each}

    <button onclick={newLine} class="mx-auto" aria-labelledby="Add Line"
      ><svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width={1.5}
        stroke="currentColor"
        class="size-7 transition-colors hover:bg-stone-800">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m19.5 8.25-7.5 7.5-7.5-7.5" />
      </svg>
    </button>
  </div>
</div>
