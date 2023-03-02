<script lang="ts">
	export let type: 'number' | 'text' = 'number';
	export let label: string = '';
</script>

<div class="flex justify-center">
	<div class="relative mb-3 w-full h-full" data-te-input-wrapper-init>
		<input
			{type}
			class="peer block min-h-[auto] w-full rounded border-0 bg-transparent py-[0.32rem] px-3 leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none  text-black [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
			id="input"
			placeholder={label}
		/>
		<label
			for="input"
			class="pointer-events-none absolute top-0 left-3 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6]  transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none text-black"
			>{label}
		</label>
	</div>
</div>
