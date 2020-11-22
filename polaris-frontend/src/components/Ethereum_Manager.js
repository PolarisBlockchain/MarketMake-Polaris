import React, {useState, useEffect} from 'react';
import Web3 from "web3";
import { MetaMaskButton } from 'rimble-ui';
import {pool_abi} from '../abi/abi'

const web3 = new Web3(Web3.givenProvider);

const PoolContractAddress = "0xCC3347CcF9108A7D9956C62F844845B1057b08C6";
const PoolContract = new web3.eth.Contract(pool_abi, PoolContractAddress);


const EthereumManagerSide = () => {
  const [account, setAccount] = useState("");
  const [conflux_account, setConfluxAccount] = useState("");
  const [amount, setAmount] = useState(0);

  const connect_metamask = async () => {
    const accounts = await window.ethereum.enable();
    setAccount(accounts[0]);
  }


  const deposit_aave = async (t) => {
    t.preventDefault();
    console.log("depositing to aave...");
    console.log(web3.utils.toWei(amount.toString(), "ether"));
    const input = web3.utils.toWei(amount.toString(), "ether");
    
    const post = await PoolContract.methods.deposit_aave(input).send(
        {   from: account,

        }, 
        function (err, res) {
            if (err) {
                console.log("An error occured", err)
                return
            }
            console.log("success!!!!");
            console.log("Hash of the transaction: " + res)
        }
    );
  }

  const redeem_aave = async (t) => {
    t.preventDefault();
    const gas = await PoolContract.methods.redeem_aave(amount).estimateGas();
    var block = await web3.eth.getBlock("latest");
    var gasLimit = block.gasLimit/block.transactions.length;
    
    const post = await PoolContract.methods.redeem_aave(amount).send(
        {   from: account,
            gas: gas,
            gasLimit: gasLimit,
        }, 
        function (err, res) {
            if (err) {
                console.log("An error occured", err)
                return
            }
            console.log("success!!!!");
            console.log("Hash of the transaction: " + res)
        }
    );
  }

  const withdraw_eth = async (t) => {
    t.preventDefault();
    const gas = await PoolContract.methods.withdraw_eth(amount).estimateGas();
    var block = await web3.eth.getBlock("latest");
    var gasLimit = block.gasLimit/block.transactions.length;
    
    const post = await PoolContract.methods.withdraw_eth(amount).send(
        {   from: account,
            gas: gas,
            gasLimit: gasLimit,
        }, 
        function (err, res) {
            if (err) {
                console.log("An error occured", err)
                return
            }
            console.log("success!!!!");
            console.log("Hash of the transaction: " + res)
        }
    );
  }
  
  const del_conflux_address = async (t) => {
    t.preventDefault();
    const gas = await PoolContract.methods.del(amount).estimateGas();
    var block = await web3.eth.getBlock("latest");
    var gasLimit = block.gasLimit/block.transactions.length;
    
    const post = await PoolContract.methods.del(amount).send(
        {   from: account,
            gas: gas,
            gasLimit: gasLimit,
        }, 
        function (err, res) {
            if (err) {
                console.log("An error occured", err)
                return
            }
            console.log("success!!!!");
            console.log("Hash of the transaction: " + res)
        }
    );
  }


  return(
    <div>
      <p>address: {account}</p>
      <MetaMaskButton onClick={connect_metamask}>Connect with MetaMask</MetaMaskButton>
      <br />
      <p></p>
      <form className="form" onSubmit={deposit_aave}>
            <label>
              Deposit Aave: 
              <input
                className="input" type="text" name="name"
                onChange={(t) => setAmount(t.target.value)}
              />
            </label>
            <button className="button" type="submit" value="Confirm">
              Confirm
            </button>
        </form>

        <form className="form" onSubmit={redeem_aave}>
            <label>
              Redeem Aave: 
              <input 
                className="input" type="text" name="name"
                onChange={(t) => setAmount(t.target.value)}
              />
            </label>
            <button className="button" type="submit" value="Confirm">
              Confirm
            </button>
        </form>

        <form className="form" onSubmit={withdraw_eth}>
            <label>
              Withdraw Eth: 
              <input 
                className="input" type="text" name="name"
                onChange={(t) => setAmount(t.target.value)}
              />
            </label>
            <button className="button" type="submit" value="Confirm">
              Confirm
            </button>
        </form>

        <form className="form" onSubmit={del_conflux_address}>
            <label>
              Delete Conflux Address:
              <input 
                className="input" type="text" name="name"
                onChange={(t) => setAmount(t.target.value)}
              />
            </label>
            <button className="button" type="submit" value="Confirm">
              Confirm
            </button>
        </form>
    </div>
  )
}

export default EthereumManagerSide;