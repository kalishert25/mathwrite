<script lang="ts">
    let { onclick } = $props();
    const fileAPIsupported = window.File && window.FileReader && window.FileList && window.Blob;
</script>
<div
    class="flex min-h-screen items-center justify-center text-lg "
  >
  <div class="flex flex-col border border-solid py-10 px-8 rounded-lg gap-6 border-gray-300 text-center">
    {#if fileAPIsupported}
        <p class="text-[1.4rem]">Please select a folder to store your notes.</p>
      <button {onclick} class="font-bold text-[2rem] mx-auto hover:text-stone-400">Choose Folder</button>
      <!-- <input type="file" id="folder-input" {onchange} class="hidden" webkitdirectory> -->
    {:else}
      <p class="text-center">The File APIs are not fully supported in this browser. <br />Please try again with Chrome or Firefox.</p>
    {/if}
    
  </div>
   
</div>