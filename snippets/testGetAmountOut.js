const { getExchanges } = require('../src/exchanges')
const instr = require('../src/instrMng')
const utils = require('../src/utils')
const ethers = require('ethers')


async function compare({
        poolAddress, 
        methodCall, 
        forkBlock, 
        strategy,
        tknOrder,
        aboveEq, 
    }) {
    let forkProvider = utils.getForkProvider(forkBlock)
    let dodo = getExchanges(forkProvider)['dodoV1']
    let decimals = tknOrder.map(tId => instr.tknIdMap[tId].decimal)
    // Fetch pool info
    let poolId = instr.poolAddressMap[poolAddress].id
    let poolInfo = await dodo.getPoolData(poolId, true).catch(e=>{
        console.log('Failed to fetch pool data')
        console.log(e)
    })
    let amountInOffset = Math.abs(poolInfo.B0-poolInfo.B)
    let amountIn = Math.round(aboveEq ? amountInOffset*10 : amountInOffset*0.1)
    let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimals[0])
    let isBaseShortage = poolInfo.B < poolInfo.B0
    let isEquilibrium = poolInfo.B == poolInfo.B0
    let stateLabel = isEquilibrium ? 'EQUILIBRIUM' : isBaseShortage ? 'BASE-SHORTAGE' : 'QUOTE-SHORTAGE'
    
    // Call contract method and compare response to the calculation
    let amountOutCall = await dodo[methodCall](poolAddress, amountInBN)
    amountOutCall = parseFloat(ethers.utils.formatUnits(amountOutCall, decimals[1]))
    let amountOutCalc = dodo.getAmountOut(amountIn, poolInfo, tknOrder)
    let diff = Math.abs(amountOutCall - amountOutCalc)
    let diffPrct = (100*diff/amountOutCall).toFixed(2) + '%'
    
    // Log it to console
    console.log('^'.repeat(50))
    console.log(strategy)
    console.log('\nPool state: ', stateLabel)
    console.log('Pool info:\n', poolInfo)
    console.log('Base amount: ', amountIn)
    console.log('Past equilibrium: ', amountInOffset<amountIn)
    console.log('Amount out from call:', amountOutCall)
    console.log('Amount out from calculation:', amountOutCalc)
    console.log('Prct deviation: ', diffPrct)
} 


                /////  QUOTE SHORTAGE FUNCTIONS  \\\\\

function getAmountOutQuoteShortageSellQuoteTknBelowEq() {
    let settings = {
        aboveEq: false, 
        poolAddress: '0x75c23271661d9d143DCb617222BC4BEc783eff34', 
        tknOrder: [ 'T0001', 'T0000' ], 
        forkBlock: 11907345, 
        methodCall: 'querySellQuoteToken', 
        strategy: 'quote-shortage | sell-quote | below-equilibrium',
    }
    compare(settings)
}

function getAmountOutQuoteShortageSellQuoteTknAboveEq() {
    let settings = {
        aboveEq: true, 
        poolAddress: '0x75c23271661d9d143DCb617222BC4BEc783eff34', 
        tknOrder: [ 'T0001', 'T0000' ], 
        forkBlock: 11907345, 
        methodCall: 'querySellQuoteToken', 
        strategy: 'quote-shortage | sell-quote | below-equilibrium',
    }
    compare(settings)
}


function getAmountOutQuoteShortageSellBaseTknBelowEq() {
    let settings = {
        aboveEq: false, 
        poolAddress: '0x75c23271661d9d143DCb617222BC4BEc783eff34', 
        tknOrder: [ 'T0000', 'T0001' ], 
        forkBlock: 11907345, 
        methodCall: 'querySellBaseToken', 
        strategy: 'quote-shortage | sell-quote | below-equilibrium',
    }
    compare(settings)
}

function getAmountOutQuoteShortageSellBaseTknAboveEq() {
    let settings = {
        aboveEq: true, 
        poolAddress: '0x75c23271661d9d143DCb617222BC4BEc783eff34', 
        tknOrder: [ 'T0000', 'T0001' ], 
        forkBlock: 11907345, 
        methodCall: 'querySellBaseToken', 
        strategy: 'quote-shortage | sell-quote | below-equilibrium',
    }
    compare(settings)
}

/////  BASE SHORTAGE FUNCTIONS  \\\\\

function getAmountOutBaseShortageSellQuoteTknBelowEq() {
    let settings = {
        aboveEq: false, 
        poolAddress: '0x75c23271661d9d143DCb617222BC4BEc783eff34', 
        tknOrder: [ 'T0001', 'T0000' ], 
        forkBlock: 11907386, 
        methodCall: 'querySellQuoteToken', 
        strategy: 'quote-shortage | sell-quote | below-equilibrium',
    }
    compare(settings)
}

function getAmountOutBaseShortageSellQuoteTknAboveEq() {
    let settings = {
        aboveEq: true, 
        poolAddress: '0x75c23271661d9d143DCb617222BC4BEc783eff34', 
        tknOrder: [ 'T0001', 'T0000' ], 
        forkBlock: 11907386, 
        methodCall: 'querySellQuoteToken', 
        strategy: 'quote-shortage | sell-quote | below-equilibrium',
    }
    compare(settings)
}


function getAmountOutBaseShortageSellBaseTknBelowEq() {
    let settings = {
        aboveEq: false, 
        poolAddress: '0x75c23271661d9d143DCb617222BC4BEc783eff34', 
        tknOrder: [ 'T0000', 'T0001' ], 
        forkBlock: 11907386, 
        methodCall: 'querySellBaseToken', 
        strategy: 'quote-shortage | sell-quote | below-equilibrium',
    }
    compare(settings)
}

function getAmountOutBaseShortageSellBaseTknAboveEq() {
    let settings = {
        aboveEq: true, 
        poolAddress: '0x75c23271661d9d143DCb617222BC4BEc783eff34', 
        tknOrder: [ 'T0000', 'T0001' ], 
        forkBlock: 11907386, 
        methodCall: 'querySellBaseToken', 
        strategy: 'quote-shortage | sell-quote | below-equilibrium',
    }
    compare(settings)
}
                

// getAmountOutQuoteShortageSellQuoteTknBelowEq()
// getAmountOutQuoteShortageSellQuoteTknAboveEq()
// getAmountOutQuoteShortageSellBaseTknBelowEq()
// getAmountOutQuoteShortageSellBaseTknAboveEq()

getAmountOutBaseShortageSellQuoteTknBelowEq()
getAmountOutBaseShortageSellQuoteTknAboveEq()
getAmountOutBaseShortageSellBaseTknBelowEq()
getAmountOutBaseShortageSellBaseTknAboveEq()