<script lang="ts">
  import svelteLogo from "./assets/svelte.svg";
  import ChooseFolder from "./lib/ChooseFolder.svelte";
  import ShowNote from "./lib/FileEdit.svelte";
  import FileExplorer from "./lib/FileExplorer.svelte";

  import viteLogo from "/vite.svg";
  import { PaneGroup, Pane, PaneResizer } from "paneforge";
  //https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle

  let selectedFile: FileSystemHandle | null = $state(null);
  let rootDirectory: FileSystemDirectoryHandle | undefined = $state();
  const onFolderChosen = async (ev: Event) => {
    //@ts-ignore
    rootDirectory = (await window.showDirectoryPicker({
      mode: "readwrite",
    })) as FileSystemDirectoryHandle;
  };
</script>

<main>
  {#if rootDirectory == undefined}
    <ChooseFolder onclick={onFolderChosen} />
  {:else}
    <PaneGroup direction="horizontal">
      <Pane defaultSize={25}
        ><FileExplorer {rootDirectory} bind:selectedFile />
      </Pane>
      <PaneResizer
        class="bg-background group relative ml-[-0.25rem] flex w-3 items-center">
        <div
          class="ml-1 h-full w-0.5 transition duration-75 ease-in group-hover:bg-blue-600 group-hover:delay-300">
        </div>
      </PaneResizer>
      <Pane defaultSize={75}>
        {#if selectedFile != null}
          <ShowNote fileSystemHandle={selectedFile} />
        {/if}</Pane>
    </PaneGroup>
  {/if}
</main>
