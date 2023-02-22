const shortenAddress = (address) => {
  return `${address.slice(0, 8)}...${address.slice(
    address.length - 8,
    address.length
  )}`;
};

export default shortenAddress;
