<script lang="ts">
  import ExplorerItem from "./ExplorerItem.svelte";
  type MenuItem = {
    displayName: string;
    kind: "file" | "directory";
    isHidden: boolean;
    isCollapsed: boolean; // isCollapsed=true only valid for kind="directory"
    isRenamable: boolean;
    nestingLevel: number;
    fileSystemHandle?: FileSystemHandle;
  };

  let {
    rootDirectory,
    selectedFile = $bindable(),
  }: {
    rootDirectory: FileSystemDirectoryHandle;
    selectedFile: FileSystemFileHandle;
  } = $props();
  let selectedDirectoryIndex: number = -1;
  let selectedDirectory = $derived.by(() => {
    if (selectedDirectoryIndex == -1) {
      return {
        displayName: "root",
        kind: "directory",
        isHidden: true,
        isCollapsed: false,
        isRenamable: false,
        nestingLevel: -1,
        fileSystemHandle: rootDirectory,
      } as MenuItem;
    }
    return menuUI[selectedDirectoryIndex];
  });
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
        isRenamable: false,
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

  const createRenamableItem = (kind: "file" | "directory") => {
    menuUI.splice(selectedDirectoryIndex + 1, 0, {
      displayName: "",
      kind,
      isHidden: false,
      isCollapsed: false,
      isRenamable: true,
      nestingLevel: selectedDirectory.nestingLevel + 1,
    });
  };

  function handleClick(i: number) {
    const item = menuUI[i];
    if (item.kind == "directory") {
      item.isCollapsed ? expandDir(i) : collapseDir(i);
      menuUI[i].isCollapsed = !menuUI[i].isCollapsed;
      selectedDirectoryIndex = i;
      return;
    }

    console.log("opening file: " + item.displayName);
    selectedFile = item.fileSystemHandle as FileSystemFileHandle;
    // set selectedDir to parent directory
    for (let j = i - 1; j >= 0; j--) {
      if (menuUI[j].nestingLevel < item.nestingLevel) {
        selectedDirectoryIndex = j;
        return;
      }
    }
    selectedDirectoryIndex = -1;
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

  async function renameItem(
    itemIndex: number,
    newName: string,
    parentDirIndex: number,
    parentDir: MenuItem,
  ) {
    if (
      menuUI[itemIndex].fileSystemHandle &&
      newName == menuUI[itemIndex].displayName
    ) {
      return;
    }
    const parentHandle =
      parentDir.fileSystemHandle as FileSystemDirectoryHandle;
    if (menuUI[itemIndex].kind == "directory") {
      // TODO fix bc we ASSUME ALWAYS EMPTY FOR NOW

      if (menuUI[itemIndex].fileSystemHandle) {
        // we will have to copy all the files from the directory into another directory, recursively
        throw new Error("Function not implemented.");
      }
      try {
        await parentHandle.getDirectoryHandle(newName);
        return; // another dir has the same name
      } catch (err) {
        if (err instanceof TypeError) {
          return; // dir name is invalid
        }
      }

      const newDirHandle = await parentHandle.getDirectoryHandle(newName, {
        create: true,
      });

      menuUI[itemIndex].displayName = newName;
      menuUI[itemIndex].isRenamable = false;
      menuUI[itemIndex].fileSystemHandle = newDirHandle;

      for (let j = itemIndex; j < menuUI.length - 1; j++) {
        const a = menuUI[j];
        const b = menuUI[j + 1];
        if (b.nestingLevel != a.nestingLevel) {
          break;
        }
        if (a.displayName.localeCompare(b.displayName) < 0) {
          break;
        }
        menuUI[j] = b;
        menuUI[j + 1] = a;
      }
    }

    try {
      await parentHandle.getFileHandle(newName + ".md");
      return; // another file has the same name
    } catch (err) {
      if (err instanceof TypeError) {
        return; // name is invalid
      }
    }

    const oldFileHandle = menuUI[itemIndex]
      .fileSystemHandle as FileSystemFileHandle;
    const newFileHandle = await parentHandle.getFileHandle(newName + ".md", {
      create: true,
    });

    if (menuUI[itemIndex].fileSystemHandle) {
      const writableStream = await newFileHandle.createWritable();
      const data = await oldFileHandle.getFile();
      await writableStream.write(data);
      await writableStream.close();
      await parentHandle.removeEntry(menuUI[itemIndex].fileSystemHandle.name);
    }

    menuUI[itemIndex].displayName = newName;
    menuUI[itemIndex].isRenamable = false;
    menuUI[itemIndex].fileSystemHandle = newFileHandle;

    for (let j = itemIndex; j < menuUI.length - 1; j++) {
      const a = menuUI[j];
      const b = menuUI[j + 1];
      if (b.kind == "directory" || b.nestingLevel != a.nestingLevel) {
        break;
      }
      if (a.displayName.localeCompare(b.displayName) < 0) {
        break;
      }
      menuUI[j] = b;
      menuUI[j + 1] = a;
    }
  }

  async function deleteItem(index: number, parentDir: MenuItem) {
    if (menuUI[index].fileSystemHandle) {
      (parentDir.fileSystemHandle as FileSystemDirectoryHandle).removeEntry(
        menuUI[index].fileSystemHandle.name,
      );
    }
    menuUI = menuUI.filter((v, i) => i !== index);
  }
</script>

<div class="relative h-screen border-r-[1px] border-stone-700 bg-stone-800">
  <div
    class="sticky top-0 flex h-10 flex-row items-center justify-center gap-2 border-stone-700 bg-stone-800 py-2">
    <button
      onclick={() => createRenamableItem("file")}
      class="rounded-lg p-1 text-stone-300 transition duration-100 ease-in-out hover:bg-stone-700"
      aria-label="New File">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </button>
    <button
      onclick={() => createRenamableItem("directory")}
      class="rounded-lg p-1 text-stone-300 transition duration-100 ease-in-out hover:bg-stone-700"
      aria-label="New Folder">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
      </svg>
    </button>
  </div>
  <div
    class=" h-[80vh] min-w-0 overflow-y-scroll overscroll-contain border-b border-t border-stone-600 px-0 pt-3">
    {#each menuUI as item, i (item.fileSystemHandle)}
      <ExplorerItem
        name={menuUI[i].displayName}
        kind={menuUI[i].kind}
        nestingLevel={menuUI[i].nestingLevel}
        isHidden={menuUI[i].isHidden}
        isCollapsed={menuUI[i].isCollapsed}
        isRenamable={menuUI[i].isRenamable}
        isSelected={(menuUI[i].fileSystemHandle as FileSystemFileHandle) ==
          selectedFile}
        onclick={() => handleClick(i)}
        onrename={(newName: string) => {
          if (newName.trim() == "") {
            deleteItem(i, selectedDirectory);
            return;
          }
          renameItem(i, newName, selectedDirectoryIndex, selectedDirectory);
        }} />
    {/each}
  </div>
</div>
