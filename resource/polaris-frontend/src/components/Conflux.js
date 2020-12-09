import React, {useState} from 'react';
import { Conflux, Drip } from 'js-conflux-sdk';
import {starcoins_abi, lottery_abi} from "../abi/abi";
import { Button } from "rimble-ui";

const conflux = new Conflux({
    url: "http://testnet-jsonrpc.conflux-chain.org:12537",
    defaultGasPrice: 100, // The default gas price of your following transactions
    defaultGas: 1000000, // The default gas of your following transactions
    logger: console,
});

const LotteryContract = {
    name: 'Lottery',
    abi: lottery_abi,
    contract: conflux.Contract({
      abi: lottery_abi,
      address: '0x8b7c13203fd2006e3f6e3613b43ce3a7aae89dcb',
    }),
}

const StarCoinContract = {
    name: 'StarCoin',
    abi: starcoins_abi,
    contract: conflux.Contract({
      abi: starcoins_abi,
      address: '0x855d31d814dce772976cc94d1f3e2b16e08fbb80',
    }),
}


const ConfluxSide = () => {
    const [account, setAccount] = useState("");
    const [amount, setAmount] = useState(0);


    const connect_conflux_portal = async () => {
        const accounts = await window.conflux.enable();
        setAccount(accounts[0]);
    }

    const mint_star_token = async (t) => {
        t.preventDefault();
        const PRIVATE_KEY = '0x66E23757B7084E3554AE77C94A3718083D24EBF9ED453E5FC84B15CD6015976C'; 
        const sender = conflux.wallet.addPrivateKey(PRIVATE_KEY);

        const txhash = await StarCoinContract.contract._mint(account, amount, 0).sendTransaction({
            from: sender.address,
        });
    }

    const enter_lottery = async () => {
        const txhash = await LotteryContract.contract.enter(10).sendTransaction({
            from: account,
        });
    }

    const get_players = async () => {
        const txhash = await LotteryContract.contract.getPlayers().call();
        console.log(txhash);
    }

    return(
        <div>
            <p>Address: {account}</p>
            <Button icon="Send" mr={3} onClick={connect_conflux_portal}>
                Connect with Conflux Portal
            </Button>
            <p></p>
            <form className="form" onSubmit={mint_star_token}>
                <label>
                Mint Star Token: 
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

            <button onClick={enter_lottery}>enter lottery</button>
            <button onClick={get_players}>get_players</button>

        </div>
    )
}


export default ConfluxSide;