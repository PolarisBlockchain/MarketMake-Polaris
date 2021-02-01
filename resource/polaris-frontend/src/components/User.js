import React, {useState, useEffect} from 'react';
import Web3 from "web3";
import { MetaMaskButton } from 'rimble-ui';
import {pool_abi} from '../abi/abi'
import { Conflux, Drip } from 'js-conflux-sdk';
import {starcoins_abi, lottery_abi} from "../abi/abi";
import { Button } from "rimble-ui";

const web3 = new Web3(Web3.givenProvider);
const PoolContractAddress = "0x4490C91C4D70A51f8BC09b2185DB571E0a22dbdf";
const PoolContract = new web3.eth.Contract(pool_abi, PoolContractAddress);

const conflux_node = new Conflux({
    //url: "http://testnet-jsonrpc.conflux-chain.org:12537",
    url: "http://test.confluxrpc.org",
    defaultGasPrice: 100, // The default gas price of your following transactions
    defaultGas: 1000000, // The default gas of your following transactions
    logger: console,
});
const LotteryContract = {
    name: 'Lottery',
    abi: lottery_abi,
    contract: conflux_node.Contract({
      abi: lottery_abi,
      address: '0x86431a9387cdaf6dc3cac742dc9046df12f88211',
    }),
}
const StarCoinContract = {
    name: 'StarCoin',
    abi: starcoins_abi,
    contract: conflux_node.Contract({
      abi: starcoins_abi,
      address: '0x855d31d814dce772976cc94d1f3e2b16e08fbb80',
    }),
}

const conflux_portal = new Conflux({

})

const Lottery = new conflux_portal.Contract({
  abi: lottery_abi,
  address: '0x86431a9387cdaf6dc3cac742dc9046df12f88211',
})




const User = () => {
  const [eth_account, setEthAccount] = useState("");
  const [conflux_account, setConfluxAccount] = useState("");
  const [amount, setAmount] = useState(0);
  const [players, setPlayers] = useState("");

  const connect_metamask = async () => {
    const accounts = await window.ethereum.enable();
    setEthAccount(accounts[0]);
  }


  const deposit_eth = async (t) => {
    t.preventDefault();
    const gas = await PoolContract.methods.enter(conflux_account).estimateGas();
    var block = await web3.eth.getBlock("latest");
    var gasLimit = block.gasLimit/block.transactions.length;
    const post = await PoolContract.methods.enter(conflux_account).send(
        {   from: eth_account,
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
            mint_star_token();
        }
    );
  }

  const connect_conflux_portal = async () => {
    const accounts = await window.conflux.enable();
    setConfluxAccount(accounts[0]);
  }

  const mint_star_token = async () => {
      console.log('minting STAR token to user... ', amount);
      const PRIVATE_KEY = '0x66E23757B7084E3554AE77C94A3718083D24EBF9ED453E5FC84B15CD6015976C'; 
      const sender = conflux_node.wallet.addPrivateKey(PRIVATE_KEY);

      const txhash = await StarCoinContract.contract._mint(conflux_account, amount*1000, 0).sendTransaction({
          from: sender.address,
      });
  }

  const enter_lottery_sponsored = async () => {
      console.log('entering user to lottery... ');
      const PRIVATE_KEY = '0x66E23757B7084E3554AE77C94A3718083D24EBF9ED453E5FC84B15CD6015976C'; 
      const sender = conflux_node.wallet.addPrivateKey(PRIVATE_KEY);

      const txhash = await LotteryContract.contract.enterSponsored(conflux_account, 10).sendTransaction({
          from: sender.address,
      });

      get_players();
  }

  const enter_lottery = async () => {

    const tx = Lottery.enter(10);
    console.log(tx);
    console.log(tx.data);

    const transactionParameters = {
      gasPrice: '0x09184e72a000', // customizable by user during ConfluxPortal confirmation.
      gas: '0x5208',  // customizable by user during ConfluxPortal confirmation.
      to: LotteryContract.contract.address, // Required except during contract publications.
      from: conflux_account, // must match user's active address.
      value: '0x00', // Only required to send ether to the recipient from the initiating external account.
      data: tx.data, // Optional, but used for defining smart contract creation and interaction.
      storageLimit: '1024' // used to limit the total storage usage of a transaction
    }
    
    window.conflux.sendAsync({
      method: 'cfx_sendTransaction',
      params: [transactionParameters],
      from: conflux_account,
    }, ()=>{})
  }

  const get_players = async () => {
      const txhash = await LotteryContract.contract.getPlayers().call();
      console.log(txhash);
      setPlayers(txhash);
  }


  return(
    <div class="container">
      <p>address: {eth_account}</p>
      <MetaMaskButton onClick={connect_metamask}>Connect with MetaMask</MetaMaskButton>
      <p></p>
      <p>Address: {conflux_account}</p>
        <Button icon="Send" mr={3} onClick={connect_conflux_portal}>
            Connect with Conflux Portal
        </Button>
    <p></p>


      <form className="form" onSubmit={deposit_eth}>
            <label>
              Deposit Ether: 
              <input
                className="input" type="text" name="name"
                onChange={(t) => setAmount(t.target.value)}
              />
            </label>
            <button className="button" type="submit" value="Confirm">
              Confirm
            </button>
        </form>
          <p></p>
          <p></p>

          

            <button onClick={enter_lottery_sponsored}>enter lottery sponsored</button>
            <br/>
            <button onClick={enter_lottery}>enter by user</button>
            <br/>
            <button onClick={get_players}>get_players</button>
            <p>Players: {players}</p>
        
    </div>
  )
}

export default User;