import { connectWallet } from '$lib/ethers';
import type { User } from '$lib/types';
import { createEffect, createEvent, createStore } from 'effector';
import Swal from 'sweetalert2';

export const walletLoginFx = createEffect<void, string[]>(async () => {
	return await connectWallet();
});

walletLoginFx.doneData.watch((res) => {
	walletLogin(res[0]);
	Swal.fire({
		icon: 'success',
		title: 'Success',
		text: 'Metamask Logged In'
	});
});

walletLoginFx.failData.watch((error) => {
	Swal.fire({
		icon: 'error',
		title: 'Oops...',
		text: 'Something went wrong!',
		footer: '<a href="">Why do I have this issue?</a>'
	});
});

const walletLogin = createEvent<string>();
export const user = createStore<User | null>(null).on(walletLogin, (prevState, payload) => {
	return prevState ? { ...prevState, ethAddress: payload } : { ethAddress: payload };
});
