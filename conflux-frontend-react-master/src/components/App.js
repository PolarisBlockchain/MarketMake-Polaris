import React from 'react'

import { ContractLottery } from '../lib/conflux'

import ConfluxNetwork from './ConfluxNetwork'
import ConfluxPortal from './ConfluxPortal'
import ConfluxContract from './ConfluxContract'
import logo from './logo_hq.png'
import { MetaMaskButton } from 'rimble-ui';
import Web3 from "web3";


import Buttons from './Enter'

export default function App () {

  const web3 = new Web3(Web3.givenProvider);

  const handleMetaMask = async () => {
    const accounts = await window.ethereum.enable();
  }

  return (
    <div className="container-fluid p-3">
      
      <div className="row">
        
        <div className="col">
          <img src={logo} className="card-img-top w-100 m-auto" alt="Conflux" />
        </div>

        <div className="col">
          {/* <div className="col-md-10 mb-3">
            <ConfluxContract {...ContractLottery} />
          </div> */}
          <div className="col-md-10 mb-3">
            <ConfluxPortal />
          </div>

          <div className="col-md-10 mb-3">
            <Buttons {...ContractLottery} />
          </div>
          <MetaMaskButton onClick={handleMetaMask} >Connect with MetaMask</MetaMaskButton>
        </div>
      </div>
    </div>
  )
}
