import React, {useState, useEffect} from 'react';
import Web3 from "web3";
import { MetaMaskButton } from 'rimble-ui';
import {pool_abi} from '../abi/abi'

const web3 = new Web3(Web3.givenProvider);

const PoolContractAddress = "0x5A1b11d630805368F712230312B44192C917Da71";
const PoolContract = new web3.eth.Contract(pool_abi, PoolContractAddress);


const EthereumSide = () => {
  const [account, setAccount] = useState("");
  const [conflux_account, setConfluxAccount] = useState("");
  const [amount, setAmount] = useState(0);

  const connect_metamask = async () => {
    const accounts = await window.ethereum.enable();
    setAccount(accounts[0]);
  }


  const deposit_eth = async (t) => {
    t.preventDefault();
    const gas = await PoolContract.methods.enter(conflux_account).estimateGas();
    var block = await web3.eth.getBlock("latest");
    var gasLimit = block.gasLimit/block.transactions.length;
    const post = await PoolContract.methods.enter(conflux_account).send(
        {   from: account,
            gas: gas,
            gasLimit: gasLimit,
            value: web3.utils.toWei(amount, "ether"),
        }, 
        function (err, res) {
            if (err) {
                console.log("An error occured", err)
                return
            }
            console.log("success!!!!");
            console.log("Hash of the transaction: " + res)

            //release STAR token to user
        }
    );
  }


  return(
    <div>
      <p>address: {account}</p>
      <MetaMaskButton onClick={connect_metamask}>Connect with MetaMask</MetaMaskButton>
      <p></p>
      <form className="form" onSubmit={deposit_eth}>
            <label>
              Deposit Ether: 
              <input
                className="input" type="text" name="name"
                onChange={(t) => setAmount(t.target.value)}
              />
            </label>
            <label>
              Conflux Address
              <input
                className="input" type="text" name="name"
                onChange={(t) => setConfluxAccount(t.target.value)}
              />
            </label>
            <button className="button" type="submit" value="Confirm">
              Confirm
            </button>
          </form>
    </div>
  )
}

export default EthereumSide;