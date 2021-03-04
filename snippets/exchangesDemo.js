const { getExchanges } = require('../src/exchanges')
const providers = require('../src/providers')
const ethers = require('ethers')
const utils = require('../src/utils')

let EXCHANGES = getExchanges(providers.ws.provider)


async function queryDodoPoolInfo(poolAddress, decimals) {
    let poolInfo = await utils.queryDodoPoolInfo(
        EXCHANGES.dodo, 
        poolAddress, 
        decimals
    )
    console.log(poolInfo)
}

async function queryDodoSellBase(poolAddress, decimals) {
    let [ quoteDec, baseDec ] = decimals 
    let dodo = EXCHANGES['dodo']
    let sellBaseAmount = ethers.utils.parseUnits('4', baseDec)  // Sell 4 Ether
    let quoteAmountOut = await dodo.querySellBaseToken(poolAddress, sellBaseAmount)
    console.log(`Swap ${ethers.utils.formatUnits(quoteAmountOut, quoteDec)} USDC for ${ethers.utils.formatUnits(buyBaseAmount, baseDec)} ETH`)
    return quoteAmountOut
}

async function queryDodoBuyBase(poolAddress, decimals) {
    let [ quoteDec, baseDec ] = decimals 
    let dodo = EXCHANGES['dodo']
    let buyBaseAmount = ethers.utils.parseUnits('4', baseDec)  // Buy 4 Ether
    let quoteAmountIn = await dodo.queryBuyBaseToken(poolAddress, buyBaseAmount)
    console.log(`Swap ${ethers.utils.formatUnits(sellBaseAmount, baseDec)} ETH for ${ethers.utils.formatUnits(quoteAmountIn, quoteDec)} USDC`)
    return quoteAmountIn
}

async function queryUniswapReserves(poolAddress, decimals) {
    let uniswap = EXCHANGES['uniswap']
    // Uniswap reserves are sorted by alphabetical order
    let reserves = await uniswap.fetchReservesRaw(poolAddress)
    let converted = utils.convertObjectWithBigNumberToNumber(
        reserves.slice(0, 2), 
        {
            '0': decimals[0], 
            '1': decimals[1], 
        }
    )
    console.log(converted)
}
