export type User = {
	ethAddress: string;
	provider: any;
	balance: string;
	txPending: boolean;
	nftBalance?: Record<string, { id: number; amount: any }>;
};
