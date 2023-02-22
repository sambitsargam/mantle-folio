import React, { useState, useEffect } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import { useAccount } from 'wagmi';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import BlockiesSvgSync from 'blockies-react-svg/dist/es/BlockiesSvgSync.mjs'

function Appy() {
  const [transactions, setTransactions] = useState([]);
  const { address, connector: activeConnector, isConnected } = useAccount();  

  useEffect(() => { // Only run once when the component mounts
    // if connected
    if (isConnected && address) {

    const fetchTransactions = async () => {
      const add = address;
      console.log(address);
      const response = await fetch(`https://explorer.testnet.mantle.xyz/api?module=account&action=txlist&address=${add}`);
      const data = await response.json();
      console.log(data);
      setTransactions(data.result.slice(0,10));
    };

    fetchTransactions();
  }
}, [address]); // Run every time the address changes
  
    function ConvertTimeStamp(unixTimestamp) {
      const date = new Date(unixTimestamp * 1000); // Convert Unix timestamp to JavaScript Date object
      return date.toUTCString();
    }

    function ViewInExplorer(hash) {
      return `https://explorer.testnet.mantle.xyz/tx/${hash}`;
    }

    function SliceAddress(address) {
      return address.slice(0, 6) + "..." + address.slice(-4);
    }

    function SliceHash(hash) {
      return hash.slice(0, 12) + "......." + hash.slice(-12);
    }


    function ConvertValue(value) {
      return value / 1000000000000000000;
    }

    function ConvertBlockies(address) {
      return <BlockiesSvgSync 
      address={address} 
    size={12}
    scale={6}
    //caseSensitive={false}
    //  className='classname'
    //  style={styles} 
      />}

       // Only run once when the component mounts

  return (
    <div>
         <Table >     
          <Thead>
            <Tr>
            <Th>Transaction Hash</Th>
            <Th>From</Th>
            <Th>To</Th>
            <Th>Block Number</Th>
            <Th>Block Conformation</Th>
            <Th>Time</Th>
            <Th>Value</Th>
          </Tr>
          </Thead>     
        <Tbody>
          {transactions.map((tx) => (
            <Tr key={tx.hash}>
              <Td>{SliceHash(tx.hash)} <a href={ViewInExplorer(tx.hash)} target="_blank" rel="noreferrer"><button className="btn btn-sm btn-outline">Open In Explorer</button></a></Td>
              <Td>{ConvertBlockies(tx.from)}</Td>
              <Td>{ConvertBlockies(tx.to)}</Td>
              <Td>#{tx.blockNumber}</Td>
              <Td>{tx.confirmations}</Td>
              <Td>{ConvertTimeStamp(tx.timeStamp)}</Td>
              <Td>{ConvertValue(tx.value)} BIT</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
}

export default Appy;
