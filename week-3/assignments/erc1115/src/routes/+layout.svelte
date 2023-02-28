<script>
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Button from '$lib/components/Button.svelte';
	import { connectWallet } from '$lib/ethers';
</script>

<!-- <nav class="w-full flex justify-end items-center h-12 bg-black text-white p-8">
	<h1>Connect Wallet</h1>
</nav> -->
<Navbar />
<Button title="Connect Wallet" onClick={connectWallet} />
<div class="m-8">
	<slot />
</div>
<footer class="p-8">
	<h1>Footer</h1>
</footer>
