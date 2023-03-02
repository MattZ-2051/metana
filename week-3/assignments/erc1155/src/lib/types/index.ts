export type User = {
	ethAddress: string;
	provider: any;
	balance: string;
	txPending: boolean;
	nftBalance?: Record<string, number>;
};
