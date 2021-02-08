const Matic = require('@maticnetwork/maticjs').default
const config = require('./config.json')

const from = config.FROM_ADDRESS // from address

// Create object of Matic
const matic = new Matic({
    maticProvider: config.MATIC_PROVIDER,
    parentProvider: config.PARENT_PROVIDER,
    rootChain: config.ROOTCHAIN_ADDRESS,
    withdrawManager: config.WITHDRAWMANAGER_ADDRESS,
    depositManager: config.DEPOSITMANAGER_ADDRESS,
    registry: config.REGISTRY,
})

const amount = '10000000000000000' // amount in wei

async function execute() {
    await matic.initialize()
    matic.setWallet(config.PRIVATE_KEY)
    // Deposit ether
    let response = await matic.depositEther(amount,{ from, gasPrice: '10000000000' })
    return response;
}