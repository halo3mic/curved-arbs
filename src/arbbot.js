const { getExchanges } = require('./exchanges')
const instrMng = require('./instrMng')
const txMng = require('./txManager')
const config = require('./config')
const utils = require('./utils')
const ethers = require('ethers')

var EXCHANGES
var POOL_DATA
var GAS_PRICE = 0  // TODO make it dynamic
var OPPS_DETECTED = 0

async function init(provider, signer) {
    EXCHANGES = getExchanges(provider)
    // POOL_DATA = await fetchPoolData()
    await txMng.init(provider, signer)
}

function updateGasPrice(gasPrice) {
    gasPrice = ethers.utils.formatUnits(gasPrice, 'gwei')
    GAS_PRICE = gasPrice
}

function getPoolData() {
    return POOL_DATA
}

function _getExchanges() {
    return EXCHANGES
}

async function fetchPoolData() {
    let allPools = [...new Set(instrMng.paths.map(p=>p.pools).flat())]
    let poolData = {}
    return Promise.all(allPools.map(async poolId => {
        let pool = instrMng.poolIdMap[poolId]
        let exchange = EXCHANGES[pool.exchange]
        poolData[poolId] = await exchange.getPoolData(poolId, true)
        return true
    })).then(()=>poolData)
}

function estimateGasAmount(nSteps) {
    return 140000*nSteps
}


async function handleUpdate(blockNumber, forward=true) {
    POOL_DATA = await fetchPoolData()
    let opps = instrMng.paths.map(path => {
        let { amountIn, profit, swapAmounts } = optimalAmountForPath(path)
        // console.log(path.symbol, 'profit:', profit)
        if (profit > MIN_PROFIT) {
            let gasAmount = estimateGasAmount(path.pools.length)
            let gasPrice = process.argv.includes('--zero-gas') ? '0' : GAS_PRICE
            // console.log(GAS_PRICE, gasPrice)
            let gasCost = gasAmount*parseFloat(gasPrice)/1e9
            let netProfit = profit - gasCost  // TODO: This only holds if input asset is ETH or WETH
            if (netProfit > MIN_PROFIT) {
                // gasPrice = (1e9*profit*0.9/gasAmount).toFixed(0)  // Send 90% of profits to the miner
                return {
                    gasPrice, 
                    gasAmount,
                    grossProfit: profit, 
                    blockNumber,
                    swapAmounts,
                    netProfit, 
                    amountIn, 
                    path
                }
            }
        }
    }).filter(e=>e)
    if (opps.length>0) {
        // TODO Get parallel opps
        OPPS_DETECTED += opps.length
        let oppsSorted = opps.sort((a, b) => b.netProfit-a.netProfit)
        handleOpps(blockNumber, [oppsSorted[0]], forward)
    } else {
        console.log('No opportunities detected')
    }
    console.log('Opps detected so far:', OPPS_DETECTED)
}

async function handleOpps(blockNumber, opps, forward=true) {
    console.log(opps)
    try {
        if (forward) {
            let response = await txMng.executeOpps(opps, blockNumber).catch(console.log)
            console.log(response['result'])
        }
        opps.forEach(printOpportunityInfo)
    } catch (e) {
        console.log(e)
    }
}

function optimalAmountForPath(path) {
    let steps = _makeSteps(path)
    let swapMethod = _makeSwapMethod(steps)
    let maxInputAmount = config.MAX_IN  // TODO make max input amount the min of reserves for all pools involved
    let amountIn = utils.getGssForTradeFunction(
        swapMethod, 
        maxInputAmount
    )
    let profit = swapMethod(amountIn)  // Gross profit
    let swapAmounts = getSwapAmounts(amountIn, steps)
    return { amountIn, profit, swapAmounts }
}

function _makeSteps(path) {
    let steps = []
    for (let i=0; i<path.pools.length; i++) {
        let pool = instrMng.poolIdMap[path.pools[i]]
        let tkns = path.tkns.slice(i, i+2)
        let exchange = EXCHANGES[pool.exchange]
        let step = {
            poolData: POOL_DATA[pool.id], 
            poolId: pool.id, 
            tknOrder: tkns,
            exchange,
        }
        steps.push(step)
    }
    return steps
}

function _makeSwapMethod(steps) {
    let swapper = (inputAmount) => {
        let amountOut = inputAmount
        for (let step of steps) {
            amountOut = step.exchange.getAmountOut(
                amountOut,
                step.poolData, 
                step.tknOrder
            )
        }
        let profit = amountOut - inputAmount
        return profit
    }
    return swapper
}

// This is not needed if using query
function getSwapAmounts(inputAmount, steps) {
    let amounts = [inputAmount]
    let amountOut = inputAmount
    for (let step of steps) {
        amountOut = step.exchange.getAmountOut(
            amountOut,
            step.poolData, 
            step.tknOrder
        )
        amounts.push(amountOut)
    }
    return amounts
}

/**
 * Log opportunity details and tx status to console
 * @param {Object} opp - Parameters describing opportunity
 * @param {Object} txReceipt - Transaction receipt
 */
 function printOpportunityInfo(opp) {
    let gasCostFormatted = opp.grossProfit - opp.netProfit
    let inputAmountFormatted = opp.swapAmounts[0]
    let grossProfitFormatted = opp.grossProfit
    let netProfitFormatted = opp.netProfit
    console.log('_'.repeat(50))
    console.log(`${opp.blockNumber} | ${Date.now()} | 🕵️‍♂️ ARB AVAILABLE`)
    console.log('Path: ', opp.path.symbol)
    console.log(`Input amount: ${inputAmountFormatted}`)
    console.log(`Gross profit: ${grossProfitFormatted}`)
    console.log(`Net profit: ${netProfitFormatted}`)
    console.log(`Gas cost: ${gasCostFormatted}`)
    console.log('^'.repeat(50))
}


module.exports = {
    optimalAmountForPath,
    getSwapAmounts,
    updateGasPrice,
    fetchPoolData,
    _getExchanges,
    handleUpdate,
    getPoolData,
    _makeSteps,
    init,
}