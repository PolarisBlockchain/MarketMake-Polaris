import React, {useState, useEffect} from 'react';
import Web3 from "web3";
import { MetaMaskButton } from 'rimble-ui';
import {pool_abi, LendingPoolAddressesProvider_abi, LendingPool_abi, AToken_abi} from '../abi/abi'

const web3 = new Web3(Web3.givenProvider);

const PoolContractAddress = "0x4490C91C4D70A51f8BC09b2185DB571E0a22dbdf";
const PoolContract = new web3.eth.Contract(pool_abi, PoolContractAddress);


const EthereumManagerSide = () => {
  const [account, setAccount] = useState("");
  const [conflux_account, setConfluxAccount] = useState("");
  const [amount, setAmount] = useState(0);

  const connect_metamask = async () => {
    const accounts = await window.ethereum.enable();
    setAccount(accounts[0]);
  }

  //https://medium.com/better-programming/how-to-supply-assets-to-the-aave-protocol-programmatically-acfb0875a2f0
  const deposit_aave = async (t) => {
    t.preventDefault();
    const providerInstance = new web3.eth.Contract(LendingPoolAddressesProvider_abi, "0x506B0B2CF20FAA8f38a4E2B524EE43e1f4458Cc5");
    const lendingPoolAddress = await providerInstance.methods.getLendingPool().call()
      .catch((e) => {
        throw Error(`Error getting lendingPool address: ${e.message}`)
    });
    const lendingPoolInstance = new web3.eth.Contract(LendingPool_abi, lendingPoolAddress);
    
    const supplyValue = web3.utils.toWei(amount.toString(), "ether");
    lendingPoolInstance.methods.deposit(
      "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", supplyValue, 0).send({from: account, value: supplyValue})
        .once('transactionHash', (hash) => {
            // transaction hash
        })
        .on('confirmation', (number, receipt) => {
            // number of confirmations
        })
        .on('error', (error) => {
            console.log(error);
        });
  }

  const redeem_aave = async (t) => {
    t.preventDefault();
    const providerInstance = new web3.eth.Contract(LendingPoolAddressesProvider_abi, "0x506B0B2CF20FAA8f38a4E2B524EE43e1f4458Cc5");
    const lendingPoolAddress = await providerInstance.methods.getLendingPool().call()
      .catch((e) => {
        throw Error(`Error getting lendingPool address: ${e.message}`)
    });
    const lendingPoolInstance = new web3.eth.Contract(LendingPool_abi, lendingPoolAddress);
    
    
    const reserveData = await lendingPoolInstance.methods.getReserveData("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE").call()
      .catch((e) => {
      throw Error(`Error getting aave reserve data: ${e.message}`)
      });
    const aTokenAddress = reserveData.aTokenAddress;
    const aTokenInstance = new web3.eth.Contract(AToken_abi, aTokenAddress);

    const withdrawAmount = web3.utils.toWei(amount.toString(), "ether");
    aTokenInstance.methods.redeem(withdrawAmount).send({from: account})
      .once('transactionHash', (hash) => {
        // transaction hash
      })
      .on('confirmation', (number, receipt) => {
        // number of confirmations
      })
      .on('error', (error) => {
        console.log(error);
    });

  }

  const withdraw_eth = async (t) => {
    t.preventDefault();
    const input = web3.utils.toWei(amount.toString(), "ether");
    const post = await PoolContract.methods.withdraw_eth(input).send(
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