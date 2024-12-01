<script lang="ts">
  import UndoRedo from "./UndoRedo.svelte";
  import { onMount } from "svelte";
  import MathInput from "./MathInput.svelte";
  import type { MathField } from "mathquill-node";
  import AutoResizeTextarea from "./AutoResizeTextarea.svelte";

  let selectedLine = $state(-1);
  let keyNum = $state(0);
  let isFileChanged = $state(false);

  let {
    fileSystemHandle,
    renameFile,
  }: {
    fileSystemHandle: FileSystemFileHandle;
    renameFile: (newName: string) => void;
  } = $props();
  let fileTitle: string = $state("");
  interface FileLine {
    id: number;
    value: string;
    initialValue: string; // hack to make the mathinputs work right. To prevent the latex being reasingned while typing which gets anoyying because it kicks you out of exponents
  }
  let fileLines: FileLine[] = $state([]);

  function stripFileExtension(filename: string) {
    const split = filename.split(".");
    return split.slice(0, split.length - 1).join("");
  }

  const readFile = async (fileSystemHandle: FileSystemFileHandle) => {
    const fileContent = await (await fileSystemHandle.getFile()).text();
    const lines = fileContent.split(/\r?\n/);

    // Extract and return strings matching the $$string$$ format
    const res: FileLine[] = lines
      .map((line: string, index: number) => {
        const match = /^\$\$(.*?)\$\$$/.exec(line.trim());
        return {
          id: index,
          value: match ? match[1] : null,
          initialValue: match ? match[1] : null,
        } as FileLine; // Capture the string within $$...$$
      })
      .filter((fl) => fl.value != null); // Remove nulls (lines that didn't match)
    console.log(res);

    return res;
  };
  function handleOutsideClick(ev: MouseEvent) {
    let target = ev?.target as HTMLElement;
    if (!target.closest("button") && !target.closest("a")) {
      selectedLine = -1;
      if (isFileChanged) {
        writeFile(fileSystemHandle, fileLines); // whenever the selection changes, save the file
      }
      isFileChanged = false;
    }
  }

  $effect(() => {
    readFile(fileSystemHandle).then((lines) => {
      isFileChanged = false;
      fileLines = lines;
      if (fileLines.length == 0) {
        fileLines = [
          {
            id: 0,
            value: "",
            initialValue: "",
          },
        ];
      }
      fileTitle = stripFileExtension(fileSystemHandle.name);
      keyNum = fileLines.length; // prevent duplicate keys
    });
  });

  async function writeFile(
    fileHandle: FileSystemFileHandle,
    fileLines: FileLine[],
  ) {
    // Create a FileSystemWritableFileStream to write to.
    const writable = await fileHandle.createWritable();
    const contents = fileLines.map((fl) => `$$${fl.value}$$`).join("\n");
    // Write the contents of the file to the stream.
    await writable.write(contents);

    // Close the file and write the contents to disk.
    await writable.close();
  }
  function handleSave(e: KeyboardEvent) {
              if (isFileChanged) {
            writeFile(fileSystemHandle, fileLines); // whenever the selection changes, save the file
            isFileChanged = false;
          }
  }

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
      initialValue: "",
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
    writeFile(fileSystemHandle, fileLines);
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

<!-- <textarea class="text-[3rem] bg-inherit border-none outline-disabled font-bold text-wrap leading-[4rem] resize-y caret-white focus:ring-0 box-border p-0" bind:value={fileTitle} ></textarea> -->

<div class="">
<div
  class=" flex h-screen w-full gap-2  flex-col items-center  pt-10 text-lg overflow-hidden">
  <div class="flex w-full h-max-[80vh] flex-col gap-3 overflow-y-scroll px-10">
    <div class="">

    
    <AutoResizeTextarea
      onblur={() => renameFile(fileTitle)}
      bind:value={fileTitle} />
    <UndoRedo />
      </div>
    {#each fileLines as line, index (line.id)}
      <MathInput
        onclick={() => {
          selectedLine = index;
          if (!isFileChanged) return;
          writeFile(fileSystemHandle, fileLines); // whenever the selection changes, save the file
          isFileChanged = false;
        }}
        {index}
        initialValue={fileLines[index].initialValue}
        bind:value={fileLines[index].value}
        deleteMe={() => {


          removeLine(index);
        }}
        onedit={() => (isFileChanged = true)}
        upOutOf={prevLine}
        downOutOf={nextLine}
        enter={handleEnter}
        isFocused={index == selectedLine} />
    {/each}

    
  </div>
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