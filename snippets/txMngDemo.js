const { getExchanges } = require('../src/exchanges')
const providers = require('../src/providers')
const txMng = require('../src/txManager')
const config = require('../src/config')
const utils = require('../src/utils')
const ethers = require('ethers')

const { provider, signer } = providers.ws
const EXCHANGES = getExchanges()

async function makeUniswapQuery1() {
    let args = {
        amountIn: ethers.utils.parseEther('22'), 
        tknPath: [
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
        ]
    }
    let queryTx = await EXCHANGES.uniswap.makeQuery(args)
    console.log(queryTx)
} 

async function makeUniswapQuery2() {
    let args = {
        amountIn: ethers.constants.Zero, 
        tknPath: [
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
        ]
    }
    let queryTx = await EXCHANGES.uniswap.makeQuery(args)
    console.log(queryTx)
} 

async function findUniswapReplacmentLoc() {
    let amountHex = 'caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3'
    let args = {
        amountIn: '0x'+amountHex, 
        tknPath: [
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
        ]
    }
    let queryTx = await EXCHANGES.uniswap.makeQuery(args)
    let bytecode = utils.convertTxDataToByteCode(queryTx.tx)
    console.log(bytecode)
    console.log((bytecode.indexOf(amountHex))/2)
}

async function makeDodoQuery1() {
    let args = {
        amountIn: ethers.utils.parseEther('22'), 
        tknPath: [
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
        ], 
        poolPath: [
            '0x75c23271661d9d143DCb617222BC4BEc783eff34'
        ]
    }
    let queryTx = await EXCHANGES.dodoV1.makeQuery(args)
    console.log(queryTx)
} 

async function makeDodoQuery2() {
    let args = {
        amountIn: ethers.constants.Zero, 
        tknPath: [
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
        ], 
        poolPath: [
            '0x75c23271661d9d143DCb617222BC4BEc783eff34'
        ]
    }
    let queryTx = await EXCHANGES.dodoV1.makeQuery(args)
    console.log(queryTx)
} 

async function findDodoReplacmentLoc() {
    let amountHex = 'caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3'
    let args = {
        amountIn: '0x'+amountHex, 
        tknPath: [
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
        ], 
        poolPath: [
            '0x75c23271661d9d143DCb617222BC4BEc783eff34'
        ]
    }
    let queryTx = await EXCHANGES.dodoV1.makeQuery(args)
    let bytecode = utils.convertTxDataToByteCode(queryTx.tx)
    console.log(bytecode)
    console.log((bytecode.indexOf(amountHex))/2)
}

async function findUniswapReplacmentLocTradeTx() {
    let amountHex = 'caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3'
    let args = {
        amountIn: '0x'+amountHex, 
        tknPath: [
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
        ], 
        to: config.DISPATCHER, 

    }
    let tradeTx = await EXCHANGES.uniswap.makeTrade(args, true)
    let bytecode = utils.convertTxDataToByteCode(tradeTx.tx)
    console.log(bytecode)
    console.log((bytecode.indexOf(amountHex))/2)
}

async function findDodoReplacmentLocTradeTx() {
    let amountHex = 'caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3caa3'
    let args = {
        amountIn: '0x'+amountHex, 
        tknPath: [
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 
        ], 
        poolPath: [
            '0x75c23271661d9d143DCb617222BC4BEc783eff34'
        ]

    }
    let tradeTx = await EXCHANGES.dodoV1.makeTrade(args)
    let bytecode = utils.convertTxDataToByteCode(tradeTx.tx)
    console.log(bytecode)
    console.log((bytecode.indexOf(amountHex))/2)
}

async function makeDispatcherTxWithQuery() {
    await txMng.init(provider, signer)
    console.log('here')
    let opp = {
        gasPrice: 200,
        grossProfit: 0.20434537819188137,
        swapAmounts: [ 41.032245058103975, 67890.19895835416, 41.236590436295856 ],
        netProfit: 0.14434537819188137,
        amountIn: 41.032245058103975,
        path: {
          id: 'I00001',
          symbol: 'weth=>usdc=>weth_uniswap=>dodov1',
          tkns: [ 'T0000', 'T0001', 'T0000' ],
          pools: [ 'P0001', 'P0000' ],
          enabled: true,
          gasAmount: 300000
        }
      }
    let queryTx = await txMng.makeQueryTx(opp)
    console.log(queryTx)
    let tradeTx = await txMng.makeTradeTx(opp)
    console.log(tradeTx)
    let gasPrice = 200
    let nonce = 1000
    let dispatcherTx = await txMng.makeDispatcherTxWithQuery(
        tradeTx, 
        queryTx, 
        gasPrice, 
        nonce
    )
    console.log(dispatcherTx)
}


makeDispatcherTxWithQuery()