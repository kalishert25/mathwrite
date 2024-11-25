<script lang="ts">
  import ExplorerItem from "./ExplorerItem.svelte";
  type MenuItem = {
    name: string;
    kind: "file" | "directory";
    isHidden: boolean;
    isCollapsed: boolean; // isCollapsed=true only valid for kind="directory"
    nestingLevel: number;
    fileSystemHandle: FileSystemHandle;
  };

  let { rootDirectory, selectedFile = $bindable() } = $props();
  let menuUI: MenuItem[] = $state([]);

  async function constructMenuUI(rootDir: FileSystemDirectoryHandle) {
    const menu: MenuItem[] = [];
    const stack: [FileSystemHandle, number][] = [[rootDir, 0]];

    while (stack.length > 0) {
      const [elem, nestingLevel] = stack.pop()!;

      menu.push({
        name: elem.name,
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

    return menu;
  }
  function handleClick(i: number) {
    const item = menuUI[i];
    if (item.kind == "directory") {
      item.isCollapsed ? expandDir(i) : collapseDir(i);
      menuUI[i].isCollapsed = !menuUI[i].isCollapsed;
    } else {
      console.log("opening file: " + item.name);
      selectedFile = item.fileSystemHandle;
    }
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
  class="flex min-h-screen min-w-0 flex-col  border-r-[1px] border-stone-700 bg-stone-800 px-0 pt-10 flex-1">
  {#each menuUI as item, i (item.fileSystemHandle)}
    <ExplorerItem
      name={menuUI[i].name}
      kind={menuUI[i].kind}
      nestingLevel={menuUI[i].nestingLevel}
      isHidden={menuUI[i].isHidden}
      isCollapsed={menuUI[i].isCollapsed}
      onclick={() => handleClick(i)} />
  {/each}
</div>
