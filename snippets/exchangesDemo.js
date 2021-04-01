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

async function getDataUniswap() {
    let poolId = 'P0001'
    let convert = true
    let poolData = await EXCHANGES.uniswap.getPoolData(poolId, convert)
    console.log(poolData)
}


async function getDataDodo() {
    let poolId = 'P0000'
    let convert = true
    let poolData = await EXCHANGES.dodo.getPoolData(poolId, convert)
    console.log(poolData)
}

function getAmountOutDodo() {
    let poolData = {
        Q0: 5527142.633923,
        B0: 6288.506553396662,
        tradeAllowed: true,
        lpFee: 0.005,
        Q: 5532763.454678,
        i: 1722.828453,
        B: 6285.157089739098,
        R: 1,
        k: 0.8,
        poolId: 'P0000'
    }
    let tknOrder = ['T0001', 'T0000']
    let amountIn = 10
    let amountOut = EXCHANGES.dodo.getAmountOut(amountIn, poolData, tknOrder)
    console.log(amountOut)
}

async function sellBaseToken() {
    let amount = 1000
    let poolId = 'P0000'
    let convert = true
    let poolData = await EXCHANGES.dodo.getPoolData(poolId, convert)
    let r1 = formulas.dodo.quoteShortageSellBase(amount, poolData)
    let r2 = formulas.dodo.baseShortageSellBase(amount, poolData)
    console.log(r1)
    console.log(r2)
}

async function buyBaseToken() {
    let amount = 1000
    let poolId = 'P0000'
    let convert = true
    let poolData = await EXCHANGES.dodo.getPoolData(poolId, convert)
    let r1 = formulas.dodo.quoteShortageBuyBase(amount, poolData)
    let r2 = formulas.dodo.baseShortageBuyBase(amount, poolData)
    console.log(r1)
    console.log(r2)
}

async function buyQuoteToken() {
    let amount = 1784.260661
    let poolId = 'P0000'
    let convert = true
    let poolData = await EXCHANGES.dodo.getPoolData(poolId, convert)
    let r1 = formulas.dodo.quoteShortageBuyQuote(amount, poolData)
    let r2 = formulas.dodo.baseShortageBuyQuote(amount, poolData)
    console.log(r1)
    console.log(r2)
}

async function sellQuoteToken() {
    let amount = 100000
    let poolId = 'P0000'
    let convert = true
    let poolData = await EXCHANGES.dodo.getPoolData(poolId, convert)
    console.log(poolData)
    let r1 = formulas.dodo.quoteShortageSellQuote(amount, poolData)
    let r2 = formulas.dodo.baseShortageSellQuote(amount, poolData)
    console.log(r1)
    console.log(r2)
}

function getAmountOutUniswap() {
    let poolData = { 
        reserve0: 129792581.0908, 
        reserve1: 75364.92272111081, 
        poolId: 'P0001'
    }
    let tknOrder = ['T0001', 'T0000']
    let amountIn = 10
    let amountOut = EXCHANGES.uniswap.getAmountOut(amountIn, poolData, tknOrder)
    console.log(amountOut)
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

async function queryDodoBuyQuote(poolAddress, decimals) {
    let [ quoteDec, baseDec ] = decimals 
    let dodo = EXCHANGES['dodo']
    let buyQuoteAmount = ethers.utils.parseUnits('4', baseDec)  // Buy 4 Ether
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


async function dodoSwap() {
    // https://etherscan.io/tx/0xfe2f84ac49deb7b687b1857f3aec5072c326e5fc121ec8fc7a6a777cfdafeecb
    let forkBlock = 11907345
    let dispatcher = '0xD30Ce37a6F2424593DaBe9b712d235781815445D'
    let unlocked_accounts = [dispatcher]
    let gp = utils.getForkProvider(forkBlock, {unlocked_accounts})
    let signer = gp.getSigner(dispatcher)
    EXCHANGES = getExchanges(gp)

    let amountIn = ethers.utils.parseEther('1')
    let amountOut = ethers.utils.parseUnits('1000', 6)
    let fromTkn = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    let toTkn = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    let poolPath = ['0x75c23271661d9d143DCb617222BC4BEc783eff34']
    let deadline = Date.now() + 300
    let dodoRouter = '0xa356867fDCEa8e71AEaF87805808803806231FdC'
    routerContract = new ethers.Contract(dodoRouter, config.ABIS['dodoRouter'])
    let txPayload = await routerContract.populateTransaction.dodoSwapV1(
        fromTkn,
        toTkn,
        amountIn,
        amountOut,
        poolPath,
        '0',
        false,
        deadline
    )
    txPayload.value = amountIn
    console.log('\nManual')
    console.log(txPayload)
    console.log('\nAuto')
    fromTkn = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    let args = {
        fromTkn,
        toTkn,
        amountIn,
        amountOut,
        poolPath
    }
    let txPayload2 = await EXCHANGES.dodov1.makeTrade(args)
    console.log(txPayload2)
    // try {
    //     let gasAmount = await signer.estimateGas(txPayload)
    //     console.log(gasAmount)
    // } catch (e) {
    //     console.log(e)
    // }
}

async function uniswapSwap() {
    let forkBlock = 11907345
    let dispatcher = '0xD30Ce37a6F2424593DaBe9b712d235781815445D'
    let unlocked_accounts = [dispatcher]
    let gp = utils.getForkProvider(forkBlock, {unlocked_accounts})
    let signer = gp.getSigner(dispatcher)
    EXCHANGES = getExchanges(gp)

    let args = {
        amountIn: ethers.utils.parseEther('1'), 
        amountOut: ethers.constants.Zero, 
        tokenPath: [
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
        ], 
        to: dispatcher
    }
    let txPayload = await EXCHANGES.uniswap.makeTrade(args)
    console.log(txPayload)
    try {
        let gasAmount = await signer.estimateGas(txPayload)
        console.log(gasAmount)
    } catch (e) {
        console.log(e)
    }
}