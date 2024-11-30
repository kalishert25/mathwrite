<script lang="ts">

    import ChooseFolder from "./lib/ChooseFolder.svelte";
    import ShowNote from "./lib/FileEdit.svelte";
    import FileExplorer from "./lib/FileExplorer.svelte";

    import { PaneGroup, Pane, PaneResizer } from "paneforge";
    //https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle

    let selectedFile: FileSystemFileHandle | undefined = $state();
    const renameFile = (newName: string) => {

    }
    let rootDirectory: FileSystemDirectoryHandle | undefined = $state();


    const onFolderChosen = async (ev: Event) => {
        //@ts-ignore
        rootDirectory = (await window.showDirectoryPicker({
            mode: "readwrite",
        })) as FileSystemDirectoryHandle;
    };
</script>

<main class="">
    {#if rootDirectory == undefined}
        <ChooseFolder onclick={onFolderChosen} />
    {:else}
        <PaneGroup direction="horizontal">
            <Pane defaultSize={25}
                ><FileExplorer
                    {rootDirectory}
                    bind:selectedFile />
            </Pane>
            <PaneResizer
                class="bg-background group relative flex w-3 items-center">
                <div
                    class=" h-screen w-0.5 transition duration-75 ease-in group-hover:bg-blue-600 group-hover:delay-300">
                </div>
            </PaneResizer>
            <Pane defaultSize={75}>
                {#if selectedFile != null}
                    <ShowNote {renameFile} fileSystemHandle={selectedFile}/>
                {/if}</Pane>
        </PaneGroup>
    {/if}
</main>
