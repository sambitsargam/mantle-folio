import { useState, useEffect } from 'react';
import axios from 'axios';
import useInterval from './useInterval';

const useFetchEthPrice = (config = {}) => {
	const { delayInterval = 20000 } = config;
	const [price, setPrice] = useState();
	const [delay, setDelay] = useState(delayInterval);

	// TODO: show value of eth in wallet in usd
	// https://github.com/MetaMask/metamask-extension/blob/b073b04789524a5cdb01e1fc2f0dfcf945b70137/ui/hooks/useCurrencyDisplay.js
	const fetchEthPrice = async () => {
		try {
			const ethPrice = await axios.get(
				'https://api.coingecko.com/api/v3/simple/price?ids=bitdao&vs_currencies=usd'
			);
			setPrice(ethPrice?.data?.bitdao?.usd);
		} catch (err) {
			console.log('LOG: eth price fetch error', err);
			setPrice();
			setDelay(null);
		}
	};

	useInterval(() => {
		fetchEthPrice();
	}, delay);

	useEffect(() => {
		fetchEthPrice();
	}, []);

	return {
		price,
	};
};

export default useFetchEthPrice;
