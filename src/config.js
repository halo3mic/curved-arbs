require('dotenv').config()
const path = require('path')
const fs = require('fs')

/**
 * Return all ABIs in abi folder packed in an object
 * @returns {Object}
 */
function loadAllABIs() {
    const abisLocalPath = "../config/abis"
    const absPath = path.resolve(`${__dirname}/${abisLocalPath}`)
    const files = fs.readdirSync(absPath)
    const abis = Object.fromEntries(files.map(fileName => [
        fileName.split('.')[0],
        require(path.join(absPath, fileName))
    ]))
    return abis
}

RPC_ENDPOINT = process.env.HTTP_ENDPOINT
WS_ENDPOINT = process.env.WS_ENDPOINT
NETWORK = 1

ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
ABIS = loadAllABIs()
ROUTERS = {
    UNISWAP: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', 
    DODO: '0xa356867fDCEa8e71AEaF87805808803806231FdC'
}
DODO_APPROVE = '0xCB859eA579b28e02B87A1FDE08d087ab9dbE5149'


module.exports = {
    RPC_ENDPOINT, 
    DODO_APPROVE,
    WS_ENDPOINT, 
    ETH_ADDRESS,
    WETH_ADDRESS,
    NETWORK,
    ROUTERS,
    ABIS, 
}