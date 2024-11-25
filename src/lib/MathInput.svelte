<script lang="ts">
  import MathQuill, { type MathField } from "mathquill-node";
    import { onMount } from "svelte";
  const MQ = MathQuill.getInterface(2);

  let {
    initialValue,
    value = $bindable(""),
    index,
    onclick,
    downOutOf,
    upOutOf,
    enter,
    deleteMe,
    isFocused,
  } = $props();
  let container: HTMLElement | undefined = $state();

    const config = {
      handlers: {
        edit: function () {

          value = mathfield!.latex();


        },
        downOutOf: downOutOf,
        upOutOf: upOutOf,
        enter: enter,
        deleteOutOf: deleteMe,
      },
      restrictMismatchedBrackets: true,
      autoSubscriptNumerals: true,
      autoCommands:
        "pi theta gamma zeta sqrt int sum prod coprod union delta Delta",
      //autoOperatorNames: "log ln sin cos tan csc sec cot sinh cosh tanh csch sech coth arcsin arccos arctan arccsc arcsec arccot arcsinh arccosh arctanh arccsch arcsech arccoth"
    };

  let mathfield: MathField | null = $state(null)

  onMount(() => {
    mathfield = MQ.MathField(container, config)
  })

  $effect(() => {

    console.log("value is "+ initialValue)
    mathfield?.latex(initialValue)

  })


  const handleClick = () => {
    if (!container) return;
    mathfield!.focus();
    console.log(value);
    onclick();
  };
</script>

<div
  class="flex border-collapse flex-row justify-between rounded-md  !text-left {isFocused
    ? 'border border-stone-700 bg-stone-800'
    : 'border border-stone-800'}"
  id="mathline-{index}"
>
  <span class="select-none px-2 pt-1">{index + 1}</span>
  <button
    bind:this={container}
    tabindex="-1"
    class="mathfield-container flex w-full flex-col justify-center overflow-hidden border-none px-3 py-5 !text-[1.5rem]"
    onmousedown={handleClick}>{value}</button
  >
  <button
    onclick={deleteMe}
    class="flex min-h-16 w-16 flex-col items-center justify-center"
    aria-labelledby="close"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width={1.5}
      stroke="currentColor"
      class="size-7 hover:text-red-300"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M6 18 18 6M6 6l12 12"
      />
    </svg>
  </button>
</div>
