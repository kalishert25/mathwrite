<script lang="ts">
  import ExplorerItem from "./ExplorerItem.svelte";
  type MenuItem = {
    displayName: string;
    kind: "file" | "directory";
    isHidden: boolean;
    isCollapsed: boolean; // isCollapsed=true only valid for kind="directory"
    nestingLevel: number;
    fileSystemHandle: FileSystemHandle;
  };

  let { rootDirectory, selectedFile = $bindable() }: {
    rootDirectory: FileSystemDirectoryHandle,
    selectedFile: FileSystemFileHandle,
  } = $props();
  let selectedDirectory: FileSystemDirectoryHandle = $state(rootDirectory)
  let menuUI: MenuItem[] = $state([]);

  async function constructMenuUI(rootDir: FileSystemDirectoryHandle) {
    const menu: MenuItem[] = [];
    const stack: [FileSystemHandle, number][] = [[rootDir, -1]];

    while (stack.length > 0) {
      const [elem, nestingLevel] = stack.pop()!;
      if (
        elem.kind == "file" &&
        elem.name.substring(elem.name.length - 3) != ".md"
      ) {
        continue;
      }

      menu.push({
        displayName:
          elem.kind == "file" ?
            elem.name.substring(0, elem.name.length - 3)
          : elem.name,
        kind: elem.kind,
        isHidden: nestingLevel > 0,
        isCollapsed: elem.kind == "directory",
        nestingLevel: nestingLevel,
        fileSystemHandle: elem,
      });

      if (elem.kind == "file") continue;
      const next: [FileSystemHandle, number][] = [];
      for await (const child of (elem as FileSystemDirectoryHandle).values()) {
        next.push([child, nestingLevel + 1]);
      }
      // files before folders; then alphetical order
      next.sort((a, b) => {
        if (a[0].kind != b[0].kind) {
          return a[0].kind == "file" ? 1 : -1;
        }
        return -a[0].name.localeCompare(b[0].name);
      });
      stack.push(...next);
    }

    return menu.slice(1);
  }

  const createFile = () => {
    
  }

  function handleClick(i: number) {
    const item = menuUI[i];
    if (item.kind == "directory") {
      item.isCollapsed ? expandDir(i) : collapseDir(i);
      menuUI[i].isCollapsed = !menuUI[i].isCollapsed;
      return;
    }

    console.log("opening file: " + item.displayName);
    selectedFile = item.fileSystemHandle as FileSystemFileHandle;

    // for(let j = i - 1; j >= 0; j--) {
    //   if(menuUI[j].nestingLevel < item.nestingLevel) {
    //     selectedParentDir = menuUI[j].fileSystemHandle
    //     console.log("parent dir: " + menuUI[j].displayName);
    //     break
    //   }
    // }
  }

  (async () => {
    menuUI = await constructMenuUI(rootDirectory);
  })();

  function expandDir(i: number) {
    const originalNestingLevel = menuUI[i].nestingLevel;

    i++;
    for (
      ;
      i < menuUI.length && menuUI[i].nestingLevel > originalNestingLevel;
      i++
    ) {
      if (menuUI[i].nestingLevel != originalNestingLevel + 1) {
        continue;
      }

      menuUI[i].isHidden = false;
      if (menuUI[i].kind == "directory" && !menuUI[i].isCollapsed) {
        expandDir(i);
      }
    }
  }

  function collapseDir(i: number) {
    const originalNestingLevel = menuUI[i].nestingLevel;

    i++;
    while (i < menuUI.length && menuUI[i].nestingLevel > originalNestingLevel) {
      menuUI[i].isHidden = true;
      i++;
    }
  }
</script>

<div

  class="flex h-full min-h-screen min-w-0 flex-1 flex-col border-r-[1px] border-stone-700 bg-stone-800 px-0 pt-3">
    <div class="flex flex-row items-center justify-center gap-2 py-1">
    <button class="hover:bg-stone-700 p-1 transition rounded-lg ease-in-out duration-100 text-stone-300" aria-label="New File">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
</svg>
    </button>
        <button class="hover:bg-stone-700 p-1 transition rounded-lg ease-in-out duration-100 text-stone-300" aria-label="New Folder">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
</svg>

    </button>
  </div>
  {#each menuUI as item, i (item.fileSystemHandle)}
    <ExplorerItem
      name={menuUI[i].displayName}
      kind={menuUI[i].kind}
      nestingLevel={menuUI[i].nestingLevel}
      isHidden={menuUI[i].isHidden}
      isCollapsed={menuUI[i].isCollapsed}
      isSelected={menuUI[i].fileSystemHandle as FileSystemFileHandle == selectedFile}
      onclick={() => handleClick(i)} />
  {/each}
</div>
