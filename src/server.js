/*
Listens for changes in reserves, updates reserves and notifies arbbot about the change.
*/

const { BigNumber } = require('ethers')
const { provider, signer } = require('./providers').ws
const arbbot = require('./arbbot')
const pools = require('../config/pools.json')
const utils = require('./utils')

const uniswapSyncTopic = '0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1'  // Sync(uint112 reserve0, uint112 reserve1)
let gasSpeed = 'fast'
let gasLoopTimeout = 10000  // ms
const poolAddresses = pools.map(p=>p.address)

async function init() {
    let startGasPrice = await utils.fetchGasPrice(gasSpeed)
    await arbbot.init(provider, signer, startGasPrice)
    startGasUpdates()
    startListeningForBlocks()
}

function startListeningForBlocks() {
    const filter = {topics: [uniswapSyncTopic]}
    provider.on('block', async (blockNumber) => {
        console.log(`\n${'^'.repeat(20)} ${blockNumber} ${'^'.repeat(20)}\n`)
        arbbot.handleUpdate(blockNumber)
    })
}

async function startGasUpdates() {
    let gasSpeed = 'rapid'
    while (1) {
        try {
            let gasPrice = await utils.fetchGasPrice(gasSpeed)
            arbbot.updateGasPrice(gasPrice)
        } catch (e) {
            console.log('Failed to fetch gas price')
            console.log(e)
            utils.sleep(gasLoopTimeout)
        } finally {
            utils.sleep(gasLoopTimeout)
        }
    }
}


init()

module.exports = {
    startGasUpdates, 

}