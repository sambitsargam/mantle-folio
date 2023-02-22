import { Fragment } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { ethers } from 'ethers';
import { Menu, Transition, Switch } from '@headlessui/react';
import shortenAddress from '@/lib/shortenAddress';
import useIsMounted from '@/lib/useIsMounted';
import useFetchEthPrice from '@/lib/useFetchEthPrice';
import Web3 from 'web3';
import { useState } from 'react';
import { useEffect } from 'react';
import {
	useAccount,
	useBalance,
	useDisconnect,
	useFeeData,
	useNetwork,
	useSwitchNetwork,
	useEnsName,
	useEnsAvatar,
} from 'wagmi';
import ConnectWallet from '@/components/ConnectWallet';
import OwnedNfts from '@/components/OwnedNfts';
import GratuityRow from '@/components/GratuityRow';
import Appy from '@/components/Transaction';
import BlockiesSvgSync from 'blockies-react-svg/dist/es/BlockiesSvgSync.mjs'


const Home = ({ autoConnectEnabled = false, setAutoConnectEnabled = () => {}, setItem = () => {} }) => {
	const isMounted = useIsMounted();
	const { chain } = useNetwork();
	const { chains, switchNetworkAsync } = useSwitchNetwork();
	const { disconnect } = useDisconnect();
	const { address, connector: activeConnector, isConnected } = useAccount();
	const { data: ensName } = useEnsName({
		address,
		chainId: 1,
	});
	const [pending, setpending] = useState([]);
	useEffect(() => { // Only run once when the component mounts
		// if connected
		if (isConnected && address) {
	const fetchpending= async () => {
		const add = address;
		const response = await fetch(`https://explorer.testnet.mantle.xyz/api?module=account&action=pendingtxlist&address=${add}`);
		const data = await response.json();
		console.log(data.status);
		setpending(data.status);
	  };
	  fetchpending();
  }
}, [address]);

	const { data: ensAvatar } = useEnsAvatar({
		address,
		chainId: 1,
	});
	const { data: balanceData } = useBalance({
		address,
	});
	const { data: feeData } = useFeeData({ chainId: chain?.id, formatUnits: 'gwei' });
	const { price: ethPrice } = useFetchEthPrice();
	const balanceValue = balanceData ? Number(ethers.utils.formatUnits(balanceData?.value, balanceData?.decimals)) : 0;
	const usdValue = chain?.id === 5001 && balanceData ? Number(ethPrice * balanceValue).toFixed(2) : 0;

	const copyToClipboard = async () => {
		await navigator.clipboard.writeText(address);
	};
    
	const web3 = new Web3('https://rpc.testnet.mantle.xyz/');
    const pendingtransactions = web3.eth.getPendingTransactions();

	const onChangeNetwork = async c => {
		await switchNetworkAsync(c.id);
	};
	const [blockNumber, setBlockNumber] = useState(null);
 useEffect(() => {
 const getBlockNumber = async () => {
 const num = await web3.eth.getBlockNumber();
 setBlockNumber(num);
 };
 getBlockNumber();
 }, []);

	return (
		<div className="flex flex-col items-start min-h-screen py-2 justify-items-start">
			<Head>
				<title>MantleFolio</title>
				<link rel="icon" href="./favicon.ico" />
			</Head>

			<main className="w-full max-w-full">
				<div className="p-4 lg:p-10">
					<div className="grid grid-cols-1 gap-6 lg:p-10 xl:grid-cols-3 lg:bg-base-200 rounded-box">
						<div className="shadow-lg card compact bg-base-100">
							<div className="flex-row items-center space-x-4 card-body">
								<div>
									<h2 className="card-title">Balance</h2>
								{isMounted && address && balanceData && (
										<h2 className="text-blue-300 card-title">
											{Number(
												ethers.utils.formatUnits(balanceData?.value, balanceData?.decimals)
											).toFixed(4)}{' '}
											{balanceData?.symbol}
										</h2>
									)}
								</div>
		
							</div>
						</div>
						<div className="overflow-visible shadow-lg card compact bg-base-100 ">
							<div className="flex-row items-center space-x-4 card-body">
								<div className="flex-1">
									<h2 className="card-title">{isMounted && chain && chain?.name}</h2>
									<p className="text-base-content text-opacity-40">
										Network {chain?.unsupported && '(unsupported)'}
									</p>
								</div>
								<div className="flex-0">
									{isMounted && (
										<Menu as="div" className="dropdown">
											<Menu.Button
												tabIndex="0"
												as="label"
												className="m-1 btn btn-sm btn-outline"
												disabled={!activeConnector}
											>
												Switch Network
											</Menu.Button>
											<Transition
												as={Fragment}
												enter="transition ease-out duration-100"
												enterFrom="transform opacity-0 scale-95"
												enterTo="transform opacity-100 scale-100"
												leave="transition ease-in duration-75"
												leaveFrom="transform opacity-100 scale-100"
												leaveTo="transform opacity-0 scale-95"
											>
												<Menu.Items
													as="ul"
													tabIndex="0"
													className="p-2 shadow dropdown-content menu bg-base-100 rounded-box w-52"
												>
													{chains &&
														chains.length > 0 &&
														chains.map(c => {
															return (
																<Menu.Item
																	key={c.id}
																	as="li"
																	onClick={() => onChangeNetwork(c)}
																>
																	{({ active }) => (
																		<a className={`${active && 'bg-base-300'}`}>
																			{c.name}
																		</a>
																	)}
																</Menu.Item>
															);
														})}
												</Menu.Items>
											</Transition>
										</Menu>
									)}
								</div>
							</div>
						</div>
						<div className="row-span-2 shadow-lg card compact bg-base-100">
							<figure>
							<BlockiesSvgSync 
  address={address} 
size={18}
scale={10}
//caseSensitive={false}
//  className='classname'
//  style={styles} 
  />
							</figure>
							<div className="flex-row items-center justify-between space-x-4 card-body">
								<div>
									<h2 className="card-title">{isMounted && address && shortenAddress(address)}</h2>
									<p className="text-base-content text-opacity-40">Wallet Address</p>
								</div>
								<div>
									<button className="btn btn-sm btn-square" onClick={() => copyToClipboard()}>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="inline-block w-6 h-6 text-gray-100 stroke-current"
											fill="none"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
											/>
										</svg>
									</button>
								</div>
							</div>
						</div>
						<div className="shadow-lg card compact bg-base-100">
							<div className="flex-row items-center space-x-4 card-body">
								<div className="flex-1">
								<h2 className="card-title">
                                        in USD</h2>
										
									{isMounted && chain?.id === 5001 && balanceData && (
									<h2 className="card-title text-blue-500">
											<span className="mr-[2px]">$</span>
											<span className="mr-2">{usdValue}</span>
											<span className="">USD</span>
										</h2>
									)}
								</div>
								<div className="flex space-x-2 flex-0"></div>
							</div>
						</div>
						<div className="shadow-lg card compact bg-base-100">
							<div className="flex-row items-center space-x-4 card-body">
								{isMounted && isConnected && (
									<>
										<div className="flex-1">
											<h2 className="card-title">{activeConnector?.name}</h2>
											<p className="text-base-content text-opacity-40">Connected With</p>
										</div>
										<div className="flex-0">
											<button
												className="btn btn-sm btn-outline"
												onClick={() => {
													setAutoConnectEnabled(false);
													setItem('autoConnectEnabled', false, 'local');
													return disconnect();
												}}
											>
												Disconnect
											</button>
										</div>
									</>
								)}
								{isMounted && !isConnected && (
									<ConnectWallet show={isConnected ? 'connected' : 'not_connected'} />
								)}
							</div>
						</div>
						<div className="shadow-lg card compact bg-base-100">
							<div className="flex-row items-center space-x-4 card-body">
								<div className="flex-1">
									{isMounted && !address && (
										<h2 className="flex items-center card-title">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="w-6 h-6 mr-2 text-red-600"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
											Not Connected
										</h2>
									)}
										{isMounted && address && (
										<h2 className="flex items-center card-title">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="w-6 h-6 mr-2 text-green-600"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
											Connected
										</h2>
									)}
								</div>
								<div className="flex-0"></div>
							</div>
						</div>
						<div className="shadow-lg card compact bg-base-100">
							<div className="flex-row items-center space-x-4 card-body">
								<label className="flex-0">
									{isMounted && (
										<Switch
											checked={autoConnectEnabled}
											onChange={checked => {
												setAutoConnectEnabled(checked);
												setItem('autoConnectEnabled', checked, 'local');
											}}
											className={`${
												autoConnectEnabled ? 'bg-blue-600' : 'bg-gray-200'
											} relative inline-flex items-center h-6 rounded-full w-11`}
										>
											<span className="sr-only">Enable AutoConnect</span>
											<span
												className={`${
													autoConnectEnabled ? 'translate-x-6' : 'translate-x-1'
												} inline-block w-4 h-4 transform bg-white rounded-full`}
											/>
										</Switch>
									)}
								</label>
								<div className="flex-1">
									<h2 className="card-title">Autoconnect</h2>
									<p className="text-base-content text-opacity-40">
										Automatically connect your wallet
									</p>
								</div>
							</div>
						</div>
						<div className="shadow-lg card compact bg-base-100">
							<div className="flex-row items-center space-x-4 card-body">
								<div className="flex-1">
									{isMounted && feeData && (
										<h2 className="text-blue-300 card-title">
											{Number(feeData?.formatted.gasPrice).toFixed(4)}
											<span className="">{'gwei'}</span>
										</h2>
									)}
									<p className="text-base-content text-opacity-40">Estimated Gas Fee</p>
								</div>
								<div className="flex space-x-2 flex-0"></div>
							</div>
						</div>

                    
						<div className="shadow-lg card compact bg-base-100">
							<div className="flex-row items-center space-x-4 card-body">
								<div className="flex-1">
																			<h2 className=" card-title">
		
											Current Block Number 
							               <h1 className="text-blue-500">
											{blockNumber}
											</h1>
										</h2>
								</div>
								<div className="flex-0"></div>
							</div>
						</div>
						<div className="shadow-lg card compact bg-base-100">
							<div className="flex-row items-center space-x-4 card-body">

								<div className="flex-1">
									<h2 className="card-title">Current Market Price {ethPrice}$</h2>
									
								</div>
							</div>
						</div>
						<div className="shadow-lg card compact bg-base-100">
							<div className="flex-row items-center space-x-4 card-body">
								<div className="flex-1">
									<h1 className="card-title">Number of Pending Transactions</h1>
									{isMounted &&  (
										<h2 className="text-blue-300 card-title">
													<h2>{pending}</h2>											
										</h2>
									)}
									<p className="text-base-content text-opacity-40"></p>
								</div>
								<div className="flex space-x-2 flex-0"></div>
							</div>
						</div>






						<div className="col-span-1 row-span-3 shadow-lg xl:col-span-3 card compact bg-base-100">
							<h1 className="card-title text-blue-700"> Last 10 Transaction</h1>
							<Appy
/>
                        </div>
						<div className="col-span-1 row-span-3 shadow-lg xl:col-span-3 card compact bg-base-100">
							<OwnedNfts
								isConnected={isConnected}
								address={address}
								ensName={ensName}
								chain={chain}
								activeConnector={activeConnector}
							/>
						</div>

						<GratuityRow address={address} chain={chain} />
					</div>
				</div>
			</main>
		</div>
	);
};

export default Home;
