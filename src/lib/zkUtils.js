export const getZkSyncProvider = async (zksync, networkName) => {
  let zkSyncProvider;
  try {
    zkSyncProvider = await zksync.getDefaultProvider(networkName);
  } catch (error) {
    console.log('Unable to connect to zkSync.');
    console.log(error);
  }
  return zkSyncProvider;
};

export const getEthereumProvider = async (ethers, networkName) => {
  let ethersProvider;
  try {
    // eslint-disable-next-line new-cap
    ethersProvider = new ethers.getDefaultProvider(networkName);
  } catch (error) {
    console.log('Could not connect to Rinkeby');
    console.log(error);
  }
  return ethersProvider;
};

export const initAccount = async (ethSigner, zkSyncProvider, zksync) => {
  // console.log('LOG: initAccount', ethSigner, zkSyncProvider, zksync);
  const zkSyncWallet = await zksync.Wallet.fromEthSigner(ethSigner, zkSyncProvider);
  return zkSyncWallet;
};

export const registerAccount = async (wallet, ethers) => {
  console.log(`Registering the ${wallet.address()} account on zkSync`);
  if (!(await wallet.isSigningKeySet())) {
    if (!(await wallet.getAccountId())) {
      throw new Error('Unknown account');
    }
    console.log('LOG: wallet Account Id', await wallet.getAccountId());
    const changePubkey = await wallet.setSigningKey({
      feeToken: 'ETH',
      fee: ethers.utils.parseEther('0.001'),
      ethAuthType: 'ECDSA',
    });
    const reciept = await changePubkey.awaitReceipt();
    console.log(`LOG: Account ${wallet.address()} is now registered`, reciept);
  }
  console.log(`LOG: Account ${wallet.address()} already registered`);
};

export const depositToZkSync = async (zkSyncWallet, token, amountToDeposit, ethers) => {
  const deposit = await zkSyncWallet.depositToSyncFromEthereum({
    depositTo: zkSyncWallet.address(),
    token: token,
    amount: ethers.utils.parseEther(amountToDeposit),
  });
  try {
    await deposit.awaitReceipt();
  } catch (error) {
    console.log('Error while awaiting confirmation from the zkSync operators.');
    console.log(error);
  }
};

export const transfer = async (from, toAddress, amountToTransfer, transferFee, token, zksync, ethers) => {
  const closestPackableAmount = zksync.utils.closestPackableTransactionAmount(
    ethers.utils.parseEther(amountToTransfer)
  );
  const closestPackableFee = zksync.utils.closestPackableTransactionFee(ethers.utils.parseEther(transferFee));

  const transfer = await from.syncTransfer({
    to: toAddress,
    token: token,
    amount: closestPackableAmount,
    fee: closestPackableFee,
  });
  const transferReceipt = await transfer.awaitReceipt();
  console.log('Got transfer receipt.');
  console.log(transferReceipt);
};

export const getFee = async (transactionType, address, token, zkSyncProvider, ethers) => {
  const feeInWei = await zkSyncProvider.getTransactionFee(transactionType, address, token);
  return ethers.utils.formatEther(feeInWei.totalFee.toString());
};

export const withdrawToEthereum = async (wallet, amountToWithdraw, withdrawalFee, token, zksync, ethers) => {
  const closestPackableAmount = zksync.utils.closestPackableTransactionAmount(
    ethers.utils.parseEther(amountToWithdraw)
  );
  const closestPackableFee = zksync.utils.closestPackableTransactionFee(ethers.utils.parseEther(withdrawalFee));
  const withdraw = await wallet.withdrawFromSyncToEthereum({
    ethAddress: wallet.address(),
    token: token,
    amount: closestPackableAmount,
    fee: closestPackableFee,
  });
  await withdraw.awaitVerifyReceipt();
  console.log('ZKP verification is complete');
};

export const displayZkSyncBalance = async (wallet, ethers) => {
  const state = await wallet.getAccountState();
  let balance = {
    committed: 0,
    verified: 0,
  };

  if (state.committed.balances.ETH) {
    console.log(
      `Commited ETH balance for ${wallet.address()}: ${ethers.utils.formatEther(state.committed.balances.ETH)}`
    );
    balance.committed = ethers.utils.formatEther(state.committed.balances.ETH);
  } else {
    console.log(`Commited ETH balance for ${wallet.address()}: 0`);
  }

  if (state.verified.balances.ETH) {
    console.log(
      `Verified ETH balance for ${wallet.address()}: ${ethers.utils.formatEther(state.verified.balances.ETH)}`
    );
    balance.verified = ethers.utils.formatEther(state.verified.balances.ETH);
  } else {
    console.log(`Verified ETH balance for ${wallet.address()}: 0`);
  }
  return balance;
};
