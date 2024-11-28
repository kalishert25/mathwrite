<script lang="ts">
    import { onMount } from "svelte";



    let { value = $bindable("") } = $props()
    let  textarea: HTMLTextAreaElement | undefined  = $state()
    function resize() {
        textarea!.style.height = "auto"
        textarea!.style.height = textarea!.scrollHeight + "px";
    }
    onMount(() => {
        textarea!.style.height = textarea!.scrollHeight + "px";
        textarea!.style.overflowY = "hidden";
    })
</script>


<textarea class="bg-inherit border-none focus:ring-0 resize-none caret-white font-bold text-5xl text-wrap flex-shrink-0" bind:this={textarea} bind:value={value} oninput={resize}>

</textarea>