import { Conflux } from 'js-conflux-sdk'

import abiLottery from './abi/Lottery.json'

const conflux = new Conflux({
  url: process.env.REACT_APP_CONFLUX_NODE_RPC,
  defaultGasPrice: 100, // The default gas price of your following transactions
  defaultGas: 1000000, // The default gas of your following transactions
  logger: console,
})


export const ContractLottery = {
  name: 'Lottery',
  abi: abiLottery,
  contract: conflux.Contract({
    abi: abiLottery,
    address: '0x81ab7d95df13bcd9470b8abad327ed0289278a3f',
  }),
}

export default conflux