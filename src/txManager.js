const instrMng = require('../src/instrMng');
const { getExchanges } = require('./exchanges');
const ethers = require('ethers');
const config = require('./config')
const utils = require('./utils')

var SIGNER, EXCHANGES, NONCE

async function init(provider, signer) {
    PROVIDER = provider
    EXCHANGES = getExchanges(provider, signer)
    SIGNER = signer
    NONCE = await signer.getTransactionCount()
}

function decToBigNumber(num, dec) {
    return ethers.utils.parseUnits((num*10**dec).toFixed(0), 'wei')
}

function makeMinerTip(opp) {
    // Pay % of the gross profit to TipJar
    let tipAmount = opp.grossProfit * config.TIP_PRCT / 100
    console.log('Miner will be tipped', tipAmount, 'eth')
    let tipJar = new ethers.Contract(config.TIP_JAR, config.ABIS['tipJar'])

}

async function makeTradeTx(opp) {
    let error = 0
    let pool, tkns, amountIn, ethVal
    let calldata = ''
    let inputLocs = []
    let amountOut = ethers.constants.Zero
    for (let i=0; i<opp.path.pools.length; i++) {
        pool = instrMng.poolIdMap[opp.path.pools[i]]
        tkns = opp.path.tkns.slice(i, i+2).map(tId=>instrMng.tknIdMap[tId])
        tknAddresses = tkns.map(t=>t.address)
        if (i==0 || !config.QUERY) {
            // amountIn = utils.unNormalizeUnits(opp.swapAmounts[i]*(1-error*i), tkns[0].decimal)
            amountIn = decToBigNumber(opp.swapAmounts[i]*(1-error*i), tkns[0].decimal)
        } else {
            amountIn = ethers.constants.Zero  // Pass in zero to replace this amount with query result during execution
        }
        let step = {
            poolPath: [pool.address],
            tknPath: tknAddresses,
            to: config.DISPATCHER,
            amountOut, 
            amountIn, 
        }
        txPayload = await EXCHANGES[pool.exchange].makeTrade(step, opp.wethEnabled)
        ethVal = i==0 ? txPayload.tx.value : ethVal
        let _inputLoc = txPayload.inputLocs.map(loc => loc+calldata.length/2)  // Relative loc + Previous bytes
        inputLocs = [...inputLocs, ..._inputLoc]
        calldata += utils.convertTxDataToByteCode(txPayload.tx)
    }
    calldata = '0x' + calldata
    return { calldata, ethVal, inputLocs }
}

async function makeQueryTx(opp) {
    let error = 0
    let pool, tkns, amountIn, ethVal
    let calldata = ''
    let inputLocs = []
    let amountOut = ethers.constants.Zero
    for (let i=0; i<opp.path.pools.length; i++) {
        pool = instrMng.poolIdMap[opp.path.pools[i]]
        tkns = opp.path.tkns.slice(i, i+2).map(tId=>instrMng.tknIdMap[tId])
        tknAddresses = tkns.map(t=>t.address)
        if (i==0 || !config.QUERY) {
            // amountIn = utils.unNormalizeUnits(opp.swapAmounts[i]*(1-error*i), tkns[0].decimal)
            amountIn = decToBigNumber(opp.swapAmounts[i]*(1-error*i), tkns[0].decimal)
        } else {
            amountIn = ethers.constants.Zero  // Pass in zero to replace this amount with query result during execution
        }
        let step = {
            poolPath: [pool.address],
            tknPath: tknAddresses,
            to: config.DISPATCHER,
            amountOut, 
            amountIn, 
        }
        txPayload = await EXCHANGES[pool.exchange].makeQuery(step, opp.wethEnabled)
        ethVal = i==0 ? txPayload.tx.value : ethVal
        let _inputLoc = txPayload.inputLocs.map(loc => loc+calldata.length/2)  // Relative loc + Previous bytes
        inputLocs = [...inputLocs, ..._inputLoc]
        calldata += utils.convertTxDataToByteCode(txPayload.tx)
    }
    calldata = '0x' + calldata
    return { calldata, ethVal, inputLocs }
}

async function makeDispatcherTxWithQuery(tradeTx, queryTx, gasPrice, nonce) {
    let dispatcher = new ethers.Contract(
        config.DISPATCHER, 
        config.ABIS['dispatcher'], 
        SIGNER
    )
    let makeTradeArgs = [
        queryTx.calldata,
        queryTx.inputLocs, 
        tradeTx.calldata, 
        tradeTx.inputLocs,
        tradeTx.ethVal,  // TODO Target price => the last query return should be greater than this (account for gas)
        tradeTx.ethVal,  // ETH input value
    ]
    gasPrice = ethers.utils.parseUnits(gasPrice, 'gwei')
    let txArgs = {
        gasPrice, 
        gasLimit: config.GAS_LIMIT, 
        nonce: nonce
    }
    let tx = await dispatcher.populateTransaction['makeTrade(bytes,uint256[],bytes,uint256[],uint256,uint256)'](
            ...makeTradeArgs, 
            txArgs
        ).catch(e=>console.log('Failed to populate dispatcher tx:', e))
    if (process.argv.includes('--simulate')) {
        try {
            await SIGNER.estimateGas(tx)
            console.log('Tx would pass!')
        } catch (e) {
            console.log('ABORTING: Transaction would fail')
            console.log(Object.values(e)[2].response)
            console.log(tx)
            return
        }
    }
    // console.log(tx)
    tx = await SIGNER.signTransaction(tx)
    return tx
}

// async function makeDispatcherTxWithoutQuery(tradeTx, gasPrice, nonce) {
//     let dispatcher = new ethers.Contract(
//         config.DISPATCHER, 
//         config.ABIS['dispatcher'], 
//         SIGNER
//     )
//     gasPrice = ethers.utils.parseUnits(gasPrice, 'gwei')
//     let makeTradeArgs = [
//         tradeTx.calldata, 
//         tradeTx.ethVal,  // ETH input value
//     ]
//     let txArgs = {
//         gasPrice: gasPrice, 
//         gasLimit: config.GAS_LIMIT, 
//         nonce: nonce
//     }
//     console.log(makeTrade)
//     console.log(txArgs)
//     return dispatcher.populateTransaction['makeTrade(bytes,uint256)'](
//             ...makeTradeArgs, 
//             txArgs
//         ).catch(e=>console.log('Failed to populate dispatcher tx:', e))
// }

async function executeOpps(opps, blockNumber) {
    return executeBatches(opps, blockNumber)
}

async function executeBatches(opps, blockNumber) {
    let nonce = await SIGNER.getTransactionCount()
    let bundle = []
    for (let opp of opps) {
        let tradeTx = await makeTradeTx(opp)
        let queryTx = await makeQueryTx(opp)
        let dispatcherTx = await makeDispatcherTxWithQuery(
            tradeTx, 
            queryTx,
            opp.gasPrice, 
            nonce
        )  // signed
        if (dispatcherTx) {
            bundle.push(dispatcherTx)
            nonce ++
        }
    }
    if (bundle.length>0) {
        try {
            if (process.argv.includes('--direct-submission')) {
                console.log('Direct submission to chain...')
                return submitToChain(bundle)
            }
            if (process.argv.includes('--call')) {
                console.log('Calling batching...')
                return callBatches(bundle, blockNumber+1)
            } else {
                console.log('Sending batches...')
                return sendBatches(bundle, blockNumber+1)
            }
            
        } catch (e) {
            console.log(e)
        }
    }
}

async function callBatches(bundles, targetBlock, debugOnly=false) {
    const ethCall = {
        method: 'eth_callBundle', 
        params: [
            bundles, 
            '0x'+targetBlock.toString(16), 
            'latest'
        ], 
        id: '1', 
        jsonrpc: '2.0'
    }
    let inter = ethers.utils.id(JSON.stringify(ethCall))
    let signature = await SIGNER.signMessage(inter)
    let senderAddress = SIGNER.address
    let archerApiParams = {
        ethCall, 
        signature, 
        senderAddress
    }
    if (debugOnly || process.argv.includes('--debug')) {
        console.log(archerApiParams)
        console.log(archerApiParams['ethCall']['params'][0])
        process.exit(0)
    }
    let t0 = Date.now()
    let response = await utils.submitBatchesToArcher(archerApiParams)
    let responseJson = await response.json()
    console.log(responseJson)
    let t1 = Date.now()
    console.log(`Latency: ${t1-t0} ms`)
    // console.log(response.body)
    utils.logToCsv({
        targetBlock, 
        body: JSON.stringify(archerApiParams)
    }, config.ARCHER_REQUESTS_LOGS_PATH)
    let savePath = response.status=='error' ? config.ARCHER_FAIL_LOGS_PATH : config.ARCHER_PASS_LOGS_PATH
    utils.logToCsv({
        bundleHash: responseJson['result'].bundleHash, 
        coinbaseDiff: responseJson['result'].coinbaseDiff, 
        results: JSON.stringify(responseJson['result']['results'])
    }, savePath)
    return responseJson
}

async function sendBatches(bundles, targetBlock, debugOnly=false) {
    const ethCall = {
        method: 'eth_sendBundle', 
        params: [
            bundles, 
            '0x'+targetBlock.toString(16)
        ], 
        id: '1', 
        jsonrpc: '2.0'
    }
    let inter = ethers.utils.id(JSON.stringify(ethCall))
    let signature = await SIGNER.signMessage(inter)
    let senderAddress = SIGNER.address
    let archerApiParams = {
        ethCall, 
        signature, 
        senderAddress
    }
    if (debugOnly) {
        return archerApiParams
    }
    let t0 = Date.now()
    let response = await utils.submitBatchesToArcher(archerApiParams)
    let responseJson = await response.json()
    console.log(responseJson)
    let t1 = Date.now()
    console.log(`Latency: ${t1-t0} ms`)
    // console.log(response.body)
    utils.logToCsv({
        targetBlock, 
        body: JSON.stringify(archerApiParams)
    }, config.ARCHER_REQUESTS_LOGS_PATH)
    let savePath = response.status=='error' ? config.ARCHER_FAIL_LOGS_PATH : config.ARCHER_PASS_LOGS_PATH
    utils.logToCsv({
        bundleHash: targetBlock,
        result: JSON.stringify(responseJson['result'])
    }, savePath)
    return responseJson
}

async function submitToChain(bundles) {
    let response = await PROVIDER.send('eth_sendRawTransaction', [bundles[0]])
    let txReceipt = await PROVIDER.waitForTransaction(response.hash)
    return txReceipt
}


module.exports = {
    makeDispatcherTxWithQuery,
    makeQueryTx,
    makeTradeTx,
    executeOpps,
    init,
}