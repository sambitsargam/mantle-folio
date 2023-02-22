import { useEffect, useState } from 'react';
import { Alchemy, Network } from 'alchemy-sdk';
import useIsMounted from '@/lib/useIsMounted';
import { Bars } from 'react-loader-spinner';
import NFTCard from '@/components/NFTCard';

const alcChainToId = {
	1: Network.ETH_MAINNET,
	5: Network.ETH_GOERLI,
	137: Network.MATIC_MAINNET,
	80001: Network.MATIC_MUMBAI,
	10: Network.OPT_MAINNET,
	42161: Network.ARB_MAINNET,
	5001: Network.MENTLE,
};

const OwnedNfts = ({ isConnected, address, chain, activeConnector }) => {
	const isMounted = useIsMounted();
	const [nfts, setNfts] = useState([]);
	const [nftsLoading, setNftsLoading] = useState(false);
	const [nftsError, setNftsError] = useState();
	const alchemy = new Alchemy({
		apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID, // Replace with your Alchemy API key.
		network: alcChainToId[chain?.id] || null, // Replace with your network.
	});

	useEffect(() => {
		if (isConnected && address) {
			const nftChainId = alcChainToId[chain?.id] ? chain.id : null;
			if (nftChainId) {
				fetchNfts(nftChainId);
			}
		}
	}, [isConnected, address]);

	useEffect(() => {
		if (!activeConnector && !isConnected) {
			setNfts([]);
			setNftsLoading(false);
			setNftsError();
		}
	}, [activeConnector, isConnected]);

	useEffect(() => {
		if (chain && isConnected) {
			onChangeNetwork(chain);
		}
	}, [chain, isConnected]);

	const onChangeNetwork = async c => {
		setNfts([]);
		setNftsError();
		const nftChainId = alcChainToId[c.id] ? c.id : null;
		if (nftChainId) {
			fetchNfts(nftChainId);
		}
	};

	const fetchNfts = async () => {
		try {
			setNftsLoading(true);

			const ownerAddress = address;
			const data = await alchemy.nft.getNftsForOwner(ownerAddress);
			// console.log('LOG: nfts', data?.ownedNfts);

			setNfts(data.ownedNfts);
			setNftsLoading(false);
		} catch (error) {
			setNftsLoading(false);
			if (error instanceof Error) {
				setNftsError(error.message);
			} else {
				setNftsError('An unknown error occurred fetching nfts');
			}
		}
	};

	return (
		<div className="card-body">
			<h2 className="my-4 text-4xl font-bold card-title">
				Owned NFTs
				<div className="ml-4 badge badge-outline badge-lg">{nfts.length}</div>
			</h2>
			{nftsLoading && !nftsError && (
				<div className="flex items-center justify-center">
					<Bars heigth="100" width="100" color="grey" ariaLabel="loading-indicator" />
				</div>
			)}
			{nftsError && (
				<div className="alert xl:col-span-3 alert-error">
					<div className="flex-1">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							className="w-6 h-6 mx-2 stroke-current"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
						<label>{nftsError}</label>
					</div>
				</div>
			)}
			{isMounted && !address && !activeConnector && (
				<div className="alert xl:col-span-3 alert-info">
					<div className="flex-1">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							className="w-6 h-6 mx-2 stroke-current"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
						<label>Connect wallet to see NFTs</label>
					</div>
				</div>
			)}
			{!nftsLoading && !nftsError && nfts.length === 0 && activeConnector && (
				<div className="alert xl:col-span-3 alert-info">
					<div className="flex-1">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							className="w-6 h-6 mx-2 stroke-current"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
						<label>No NFTs associated with this wallet yet! Go buy some!</label>
					</div>
				</div>
			)}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 sm:max-h-[550px] overflow-scroll">
				{!nftsLoading &&
					nfts.length > 0 &&
					nfts.map(nft => {
						return <NFTCard data={nft} key={`${nft.contract.address}-${nft.tokenId}`} />;
					})}
			</div>
		</div>
	);
};

export default OwnedNfts;
