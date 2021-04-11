require('dotenv').config()
const path = require('path')
const fs = require('fs')
const ethers = require('ethers')

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

function getPrivateKey() {
    // Specify private key through an argument
    let prefix = '--pk='
    let pkNum = process.argv.filter(a => a.includes(prefix))
    let pkWithAddress = pkNum.length>0 ? process.env[`PK${pkNum[0].replace(prefix, '')}`] : process.env.PK1
    let pk = pkWithAddress.slice(43)
    return pk
}

MAX_IN = 1e5
MIN_PROFIT = 0.05
RPC_ENDPOINT = process.env.HTTP_ENDPOINT
WS_ENDPOINT = process.env.WS_ENDPOINT
PRIVATE_KEY = getPrivateKey()
NETWORK = 1
GAS_PRICE_LIMIT = ethers.utils.parseUnits('2000', 'gwei')
BASE_ASSET = 'T0000'
MAX_HOPS = 3
GAS_LIMIT = 800000
TIP_PRCT = 90

ARCHER_BATCHES_URL = 'https://api.archerdao.io/v1/bundle/send'
ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
DISPATCHER_TIPPER = '0xFB455a922F179Ba796400586682c2f6fca4d4C56'
ABIS = loadAllABIs()
ROUTERS = {
    UNIISH_PROXY: '0x121835e15703a1a7bab32626d0927D60F90A81D7',
    UNISWAP: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', 
    DODO: '0xa356867fDCEa8e71AEaF87805808803806231FdC', 
    SASHIMISWAP: '0xe4FE6a45f354E845F954CdDeE6084603CEDB9410',
    SUSHISWAP: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
    MOONISWAP: '0x798934cdcfAe18764ef4819274687Df3fB24B99B',
    WHITESWAP: '0x463672ffdED540f7613d3e8248e3a8a51bAF7217',
    POLYIENT: '0x5F54e90b296174709Bc00cfC0Cd2b69Cf55b2064',
    LINKSWAP: '0xA7eCe0911FE8C60bff9e99f8fAFcDBE56e07afF1',
    CRYPTO: '0xCeB90E4C17d626BE0fACd78b79c9c87d7ca181b3',
}
APPROVERS = {
    UNISWAP: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', 
    DODO: '0xCB859eA579b28e02B87A1FDE08d087ab9dbE5149', 
    SASHIMISWAP: '0xe4FE6a45f354E845F954CdDeE6084603CEDB9410',
    SUSHISWAP: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
    MOONISWAP: '0x798934cdcfAe18764ef4819274687Df3fB24B99B',
    WHITESWAP: '0x463672ffdED540f7613d3e8248e3a8a51bAF7217',
    POLYIENT: '0x5F54e90b296174709Bc00cfC0Cd2b69Cf55b2064',
    LINKSWAP: '0xA7eCe0911FE8C60bff9e99f8fAFcDBE56e07afF1',
    CRYPTO: '0xCeB90E4C17d626BE0fACd78b79c9c87d7ca181b3',
}
DODO_APPROVE = '0xCB859eA579b28e02B87A1FDE08d087ab9dbE5149'
DODO_HELPER = '0x533dA777aeDCE766CEAe696bf90f8541A4bA80Eb'
DISPATCHER = '0x5dc60BC57d7846EEB5C046345950c69224C83b6E'

QUERY = true  // Whether to include the query or not
ARCHER_REQUESTS_LOGS_PATH='./logs/requests.csv'
ARCHER_FAIL_LOGS_PATH = './logs/responsesFail.csv'
ARCHER_PASS_LOGS_PATH = './logs/responsesPass.csv'

module.exports = {
    ARCHER_REQUESTS_LOGS_PATH, 
    ARCHER_FAIL_LOGS_PATH, 
    ARCHER_PASS_LOGS_PATH,
    ARCHER_BATCHES_URL,
    DISPATCHER_TIPPER,
    GAS_PRICE_LIMIT,
    RPC_ENDPOINT, 
    DODO_APPROVE,
    WS_ENDPOINT, 
    ETH_ADDRESS,
    DODO_HELPER,
    WETH_ADDRESS,
    APPROVERS,
    MIN_PROFIT,
    PRIVATE_KEY,
    DISPATCHER,
    BASE_ASSET,
    GAS_LIMIT,
    MAX_HOPS,
    TIP_PRCT,
    NETWORK,
    ROUTERS,
    MAX_IN,
    QUERY,
    ABIS, 
}