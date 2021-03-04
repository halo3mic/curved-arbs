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

ABIS = loadAllABIs()
ROUTERS = {
    UNISWAP: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
}

module.exports = {
    RPC_ENDPOINT, 
    WS_ENDPOINT, 
    NETWORK,
    ROUTERS,
    ABIS, 
}