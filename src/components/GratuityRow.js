import { useState, useEffect, useRef } from 'react';
import { Bars } from 'react-loader-spinner';
import { ethers, constants } from 'ethers';
import useIsMounted from '@/lib/useIsMounted';
import toast from 'react-hot-toast';

import GratuityJSON from '@/lib/abis/Gratuity.json';
import {
	useContractRead,
	useContractWrite,
	usePrepareContractWrite,
	useWaitForTransaction,
	useContractEvent,
} from 'wagmi';

const CONTRACT = '0xf1849773a5e862f297bce5626a785d454f68800a';
const contractAddressConfig = chainId => {
	const config = {
		
		5001: {
			name: 'mantle',
			address: CONTRACT,
		},
	
	};
	return config[chainId] || false;
};

const initialFormInput = {
	gratuityAmount: '0',
	message: '',
};

const GratuityRow = ({ address, chain }) => {
	const isMounted = useIsMounted();
	const [totalGratuity, setTotalGratuity] = useState(0);
	const [gratuityItems, setGratuityItems] = useState([]);
	const [formInput, updateFormInput] = useState(initialFormInput);
	const [contractArgs, setContractArgs] = useState(initialFormInput);
	const depositFuncRef = useRef();

	// -----------------------------------------
	// CONTRACT write hooks
	// -----------------------------------------
	const contractConfig = {
		address: contractAddressConfig(chain?.id)?.address || constants.AddressZero,
		abi: GratuityJSON.abi,
	};

	const [depositEnabled, setDepositEnabled] = useState(false);

	const { config: contractWriteConfig, status } = usePrepareContractWrite({
		...contractConfig,
		functionName: 'deposit',
		enabled: Boolean(depositEnabled),
		args: [contractArgs.message],
		overrides: {
			value: ethers.utils.parseEther(contractArgs.gratuityAmount),
		},
		onError: error => {
			console.log('Error prepare', error);
			setDepositEnabled(false);
		},
		onSuccess: data => {
			// Needed for depositFunRef useEffect to run and set
			setTimeout(() => {
				depositGratuity();
			}, 1000);
		},
	});

	const {
		data: depositData,
		writeAsync: deposit,
		isLoading: depositLoading,
		isSuccess: depositSuccess,
		error: depositError,
	} = useContractWrite(contractWriteConfig);

	const {
		data: txData,
		isSuccess: txSuccess,
		error: txError,
	} = useWaitForTransaction({
		hash: depositData?.hash,
	});

	useEffect(() => {
		if (depositSuccess && txSuccess && !txError && txData) {
			const link = `${chain.blockExplorers.default.url}/tx/${txData.transactionHash}`;
			// TODO: add dismiss button
			toast.success(
				<span>
					Deposit transation succeeded! View your transation here:{' '}
					<a href={link} target="_blank" rel="noreferrer noopener">
						{link}
					</a>
				</span>,
				{
					style: { 'word-break': 'break-all' },
				}
			);
		}
	}, [txData, depositSuccess, txSuccess, txError]);

	useEffect(() => {
		if (deposit && typeof deposit === 'function') {
			depositFuncRef.current = deposit;
		}
	}, [deposit]);

	// -----------------------------------------
	// end CONTRACT write hooks
	// -----------------------------------------

	// -----------------------------------------
	// CONTRACT read/event hooks
	// -----------------------------------------
	useContractEvent({
		...contractConfig,
		eventName: 'GratuityItemGifted',
		listener: event => {
			console.log('LOG: event', event);
			// reset
			reset();
		},
	});

	useContractRead({
		...contractConfig,
		functionName: 'getTotalGratuity',
		enabled: address,
		watch: true,
		onSuccess: data => {
			setTotalGratuity(ethers.utils.formatEther(data));
		},
		onError: async error => {
			console.log('LOG: contract read error getTotalGratuity', error);
		},
	});

	useContractRead({
		...contractConfig,
		functionName: 'getAllGratuityItems',
		enabled: address,
		watch: true,
		onSuccess: async data => {
			const items = await formatGratuityItems(data);
			setGratuityItems(items);
		},
		onError: async error => {
			console.log('LOG: contract read error getAllGratuityItems', error);
		},
	});
	// -----------------------------------------
	// end CONTRACT read/event hooks
	// -----------------------------------------

	const depositGratuity = async () => {
		try {
			await depositFuncRef.current();
		} catch (error) {
			const msg =
				error?.code === 'ACTION_REJECTED'
					? 'Transaction was denied!'
					: `Transaction failed! Code: ${error.code}`;
			toast.error(msg);
			console.log('LOG: error deposit', error.code, JSON.stringify(error));
			reset();
		}
	};

	const toggleDeposit = async () => {
		try {
			const { gratuityAmount, message } = formInput;
			if (!gratuityAmount || !message) return;

			setContractArgs({
				gratuityAmount,
				message,
			});
			setDepositEnabled(true);
		} catch (e) {
			console.log('LOG: deposit error', e);
		}
	};

	const formatGratuityItems = async data => {
		const items = await Promise.all(
			data.map(async i => {
				let item = {
					amount: ethers.utils.formatEther(i.amount),
					sender: i.sender,
					message: i.message,
				};
				return item;
			})
		);
		const reversedItems = [...items].reverse();
		return reversedItems;
	};

	const reset = () => {
		setDepositEnabled(false);
		setContractArgs(initialFormInput);
		updateFormInput(initialFormInput);

		depositFuncRef.current = null;
	};

	return (
		<>
			<div className="shadow-lg card compact bg-base-100">
				<div className="card-body">
					<div className="card-title">Like this dashboard? Send a tip!</div>
					{isMounted && depositLoading && !depositError && (
						<div className="flex items-center justify-center mt-8">
							<Bars heigth="100" width="100" color="grey" ariaLabel="loading-indicator" />
						</div>
					)}
					{isMounted && !depositLoading && contractAddressConfig(chain?.id) && (
						<>
							<div className="form-control">
								<label className="label">
									<span className="label-text">Gratuity</span>
								</label>
								<label className="input-group input-group-md">
									<input
										type="text"
										placeholder="0.001"
										className="input input-bordered input-md"
										onChange={e =>
											updateFormInput({
												...formInput,
												gratuityAmount: e.target.value,
											})
										}
									/>
									<span>{chain?.nativeCurrency.symbol}</span>
								</label>
							</div>
							<div className="form-control">
								<label className="label">
									<span className="label-text">Message</span>
								</label>
								<input
									type="text"
									placeholder="message"
									maxLength="120"
									className="input input-bordered input-md"
									onChange={e =>
										updateFormInput({
											...formInput,
											message: e.target.value,
										})
									}
								/>
							</div>
							<button
								onClick={() => toggleDeposit()}
								className="mt-4 btn btn-block btn-accent"
								disabled={!formInput.gratuityAmount}
							>
								Send Gratuity
							</button>
						</>
					)}
					{isMounted && !contractAddressConfig(chain?.id) && (
						<p className="text-base-content">contract not deployed to the current chain</p>
					)}
				</div>
			</div>
			<div className="shadow-lg card compact bg-base-100">
				<div className="card-body">
					<div className="card-title">Gratuity Messages</div>
					{isMounted && contractAddressConfig(chain?.id) && (
						<ul className="px-0 py-4 overflow-scroll divide-y-2 bg-base-100 text-opacity-40 rounded-box max-h-64 divide-neutral-content">
							{gratuityItems.map((item, index) => {
								return (
									<li key={`gitem-${index}`} className="py-2">
										<a
											href={`${chain.blockExplorers.default.url}/address/${item.sender}`}
											target="_blank"
											rel="noreferrer nofollow"
											className="px-0 py-4"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="inline-block w-5 h-5 mr-2 stroke-current"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
											({item.amount}) {item.message}
										</a>
									</li>
								);
							})}
						</ul>
					)}
					{isMounted && !contractAddressConfig(chain?.id) && (
						<p className="text-base-content">contract not deployed to the current chain</p>
					)}
				</div>
			</div>
			<div className="shadow-lg card compact bg-base-100">
				<div className="card-body">
					<div className="card-title">Gratuity Contract Stats</div>
					{isMounted && contractAddressConfig(chain?.id) && (
						<div className="flex-row items-center justify-center">
							<div className="w-full shadow stats">
								<div className="stat">
									<div className="text-green-700 stat-figure">
										{/*<svg
														xmlns="http://www.w3.org/2000/svg"
														fill="none"
														viewBox="0 0 24 24"
														className="inline-block w-8 h-8 stroke-current"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2"
															d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
														></path>
								</svg>*/}
									</div>
									<div className="stat-title">Total</div>
									<div className="stat-value">{totalGratuity}</div>
									<div className="text-success stat-desc ">
										{chain?.nativeCurrency.symbol} donated
									</div>
								</div>
								<div className="stat">
									<div className="text-green-700 stat-figure">
										{/*<svg
														xmlns="http://www.w3.org/2000/svg"
														fill="none"
														viewBox="0 0 24 24"
														className="inline-block w-8 h-8 stroke-current"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2"
															d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
														></path>
							</svg>*/}
									</div>
									<div className="stat-title">Total</div>
									<div className="stat-value">{gratuityItems.length}</div>
									<div className="text-success stat-desc">donations</div>
								</div>
							</div>
						</div>
					)}
					{isMounted && !contractAddressConfig(chain?.id) && (
						<p className="text-base-content">contract not deployed to the current chain</p>
					)}
				</div>
			</div>
		</>
	);
};

export default GratuityRow;
