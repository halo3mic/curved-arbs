const { getExchanges } = require('../src/exchanges')
const formulas = require('../src/formulas')
const utils = require('../src/utils')
const ethers = require('ethers')


async function compare({
        methodCalcInverse,
        poolAddress, 
        methodCall, 
        methodCalc,
        forkBlock, 
        strategy,
        decimals, 
        aboveEq, 
    }) {
    let forkProvider = utils.getForkProvider(forkBlock)
    let dodoContract = getExchanges(forkProvider)['dodo']

    // Fetch pool info
    let poolInfo = await utils.queryDodoPoolInfo(
        dodoContract,
        poolAddress, 
        decimals, 
    )
    let baseOffset = Math.abs(poolInfo.B0-poolInfo.B)
    let baseAmount = aboveEq ? baseOffset*10 : baseOffset*0.1
    let baseAmountBN = ethers.utils.parseUnits(baseAmount.toString(), decimals[1])
    let isBaseShortage = poolInfo.B < poolInfo.B0
    let isEquilibrium = poolInfo.B == poolInfo.B0
    let stateLabel = isEquilibrium ? 'EQUILIBRIUM' : isBaseShortage ? 'BASE-SHORTAGE' : 'QUOTE-SHORTAGE'
    
    // Call contract method and compare response to the calculation
    let quotesCall = await dodoContract[methodCall](poolAddress, baseAmountBN)
    let quotesCalc = formulas.dodo[methodCalc](baseAmount, poolInfo)
    let baseCalc = formulas.dodo[methodCalcInverse](-quotesCalc, poolInfo)
    let quoteCallFormatted = parseFloat(ethers.utils.formatUnits(quotesCall, decimals[0]))
    let diff = Math.abs(quoteCallFormatted - quotesCalc)
    let diffPrct = (100*diff/quoteCallFormatted).toFixed(2) + '%'
    
    // Log it to console
    console.log('^'.repeat(50))
    console.log(strategy)
    console.log('\nPool state: ', stateLabel)
    console.log('Pool info:\n', poolInfo)
    console.log('Base amount: ', baseAmount)
    console.log('Past equilibrium: ', baseOffset<baseAmount)
    console.log('Quote amount from call:', quoteCallFormatted)
    console.log('Quote amount from calculation:', quotesCalc)
    console.log('Prct deviation: ', diffPrct)
    console.log('Base amount from calculation:', baseCalc)
} 


                /////  QUOTE SHORTAGE FUNCTIONS  \\\\\

/**
 * Compare trade query result from local calculation and chain call,
 * for the following conditions:
 *      quote-shortage | sell-base | below-equilibrium
 */
async function testQuoteShortageSellBaseBelowEquilibrium() {
    let settings = {
        aboveEq: false, 
        poolAddress: '0x75c23271661d9d143DCb617222BC4BEc783eff34', 
        decimals: [ 6, 18 ], 
        forkBlock: 11907345, 
        methodCall: 'querySellBaseToken', 
        methodCalc: 'quoteShortageSellBase', 
        methodCalcInverse: 'quoteShortageBuyQuote', 
        strategy: 'quote-shortage | sell-base | below-equilibrium',
    }
    compare(settings)
}

/**
 * Compare trade query result from local calculation and chain call,
 * for the following conditions:
 *      quote-shortage | sell-base | above-equilibrium
 */
async function testQuoteShortageSellBaseAboveEquilibrium() {
    let settings = {
        aboveEq: true, 
        poolAddress: '0x75c23271661d9d143DCb617222BC4BEc783eff34', 
        decimals: [ 6, 18 ], 
        forkBlock: 11907345, 
        methodCall: 'querySellBaseToken', 
        methodCalc: 'quoteShortageSellBase',
        methodCalcInverse: 'quoteShortageBuyQuote', 
        strategy: 'quote-shortage | sell-base | above-equilibrium',
    }
    compare(settings)
}

/**
 * Compare trade query result from local calculation and chain call,
 * for the following conditions:
 *      quote-shortage | buy-base | below-equilibrium
 */
async function testQuoteShortageBuyBaseBelowEquilibrium() {
    let settings = {
        aboveEq: false, 
        poolAddress: '0x75c23271661d9d143DCb617222BC4BEc783eff34', 
        decimals: [ 6, 18 ], 
        forkBlock: 11907345, 
        methodCall: 'queryBuyBaseToken', 
        methodCalc: 'quoteShortageBuyBase',
        methodCalcInverse: 'quoteShortageSellQuote', 
        strategy: 'quote-shortage | buy-base | below-equilibrium',
    }
    compare(settings)
}

/**
 * Compare trade query result from local calculation and chain call,
 * for the following conditions:
 *      quote-shortage | buy-base | above-equilibrium
 */
async function testQuoteShortageBuyBaseAboveEquilibrium() {
    let settings = {
        aboveEq: true, 
        poolAddress: '0x75c23271661d9d143DCb617222BC4BEc783eff34', 
        decimals: [ 6, 18 ], 
        forkBlock: 11907345, 
        methodCall: 'queryBuyBaseToken', 
        methodCalc: 'quoteShortageBuyBase',
        methodCalcInverse: 'quoteShortageSellQuote', 
        strategy: 'quote-shortage | buy-base | above-equilibrium',
    }
    compare(settings)
}


                /////  BASE SHORTAGE FUNCTIONS  \\\\\

/**
 * Compare trade query result from local calculation and chain call,
 * for the following conditions:
 *      base-shortage | sell-base | below-equilibrium
 */
async function testBaseShortageSellBaseBelowEquilibrium() {
    let settings = {
        aboveEq: false, 
        poolAddress: '0x75c23271661d9d143DCb617222BC4BEc783eff34', 
        decimals: [ 6, 18 ], 
        forkBlock: 11907386, 
        methodCall: 'querySellBaseToken', 
        methodCalc: 'baseShortageSellBase',
        methodCalcInverse: 'baseShortageBuyQuote', 
        strategy: 'base-shortage | sell-base | below-equilibrium',
    }
    compare(settings)
}

/**
 * Compare trade query result from local calculation and chain call,
 * for the following conditions:
 *      base-shortage | sell-base | above-equilibrium
 */
async function testBaseShortageSellBaseAboveEquilibrium() {
    let settings = {
        aboveEq: true, 
        poolAddress: '0x75c23271661d9d143DCb617222BC4BEc783eff34', 
        decimals: [ 6, 18 ], 
        forkBlock: 11907386, 
        methodCall: 'querySellBaseToken', 
        methodCalc: 'quoteShortageSellBase',
        methodCalcInverse: 'quoteShortageBuyQuote', 
        strategy: 'base-shortage | sell-base | above-equilibrium',
    }
    compare(settings)
}

/**
 * Compare trade query result from local calculation and chain call,
 * for the following conditions:
 *      base-shortage | buy-base | below-equilibrium
 */
async function testBaseShortageBuyBaseBelowEquilibrium() {
    let settings = {
        aboveEq: false, 
        poolAddress: '0x75c23271661d9d143DCb617222BC4BEc783eff34', 
        decimals: [ 6, 18 ], 
        forkBlock: 11907386, 
        methodCall: 'queryBuyBaseToken', 
        methodCalc: 'baseShortageBuyBase',
        methodCalcInverse: 'baseShortageSellQuote', 
        strategy: 'base-shortage | buy-base | below-equilibrium',
    }
    compare(settings)
}

/**
 * Compare trade query result from local calculation and chain call,
 * for the following conditions:
 *      base-shortage | buy-base | above-equilibrium
 */
async function testBaseShortageBuyBaseAboveEquilibrium() {
    let settings = {
        aboveEq: true, 
        poolAddress: '0x75c23271661d9d143DCb617222BC4BEc783eff34', 
        decimals: [ 6, 18 ], 
        forkBlock: 11907386, 
        methodCall: 'queryBuyBaseToken', 
        methodCalc: 'quoteShortageBuyBase',
        methodCalcInverse: 'quoteShortageSellQuote', 
        strategy: 'base-shortage | buy-base | above-equilibrium'
    }
    compare(settings)
}

async function main() {
    const methods = [
        {
            method: testQuoteShortageSellBaseBelowEquilibrium,
            tags: [    
                'quote-short', 
                'sell-base', 
                'below-eq'
            ]
        },
        {
            method: testQuoteShortageSellBaseAboveEquilibrium,
            tags: [        
                'quote-short', 
                'sell-base', 
                'above-eq'
            ]
        },
        { 
            method: testQuoteShortageBuyBaseBelowEquilibrium,
            tags: [        
                'quote-short', 
                'buy-base', 
                'below-eq'
            ]
         
        },
        { 
            method: testQuoteShortageBuyBaseAboveEquilibrium,
            tags: [        
                'quote-short', 
                'buy-base', 
                'above-eq'
            ]
        },
        { 
            method: testBaseShortageSellBaseBelowEquilibrium,
            tags: [    
                'base-short', 
                'sell-base', 
                'below-eq'
            ]
         
        },
        { 
            method: testBaseShortageSellBaseAboveEquilibrium,
            tags: [    
                'base-short', 
                'sell-base', 
                'above-eq'
            ]
         
        },
        { 
            method: testBaseShortageBuyBaseBelowEquilibrium,
            tags: [    
                'base-short', 
                'buy-base', 
                'below-eq'
            ]
         
        },
        { 
            method: testBaseShortageBuyBaseAboveEquilibrium,
            tags: [    
                'base-short', 
                'buy-base', 
                'above-eq'
            ]
        } 
    ]
    const tags = process.argv.filter(arg => arg.startsWith('--')).map(arg=>arg.slice(2))
    for (let method of methods) {
        let includesAllTags = method.tags.filter(t=>tags.includes(t)).length==tags.length
        if (includesAllTags) {
            await method.method()
        }
    }
}

main()


