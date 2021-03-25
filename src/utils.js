const providers = require('./providers')
const ethers = require('ethers')
const gss = require('gss')


async function approveERC20ForDispatcher(provider, signer, spender, tokens) {
    let dispatcher = '0xD30Ce37a6F2424593DaBe9b712d235781815445D'
    let dispatcherContract = new ethers.Contract(dispatcher, config.ABIS['dispatcher'], signer)
    let tx = await dispatcherContract.populateTransaction.tokenAllowAll(tokens, spender)
    let response = await signer.sendTransaction(tx)
    return provider.waitForTransaction(response.hash)    
}

function convertObjectWithBigNumberToNumber(obj, decMap) {
    let newObj = {...obj}
    for (let key of Object.keys(obj)) {
        if (obj[key] instanceof ethers.BigNumber) {
            let dec = decMap[key] || 18
            newObj[key] = parseFloat(ethers.utils.formatUnits(obj[key], dec))
        }
    }
    return newObj
}

function getForkProvider(blockNumber, params) {
    let ganacheParams = {
        fork: `${providers.ws.endpoint}@${blockNumber}`
    }
    ganacheParams = params ? {...params, ...ganacheParams} : ganacheParams
    return providers.setGancheProvider(ganacheParams)
}

async function queryDodoPoolInfo(dodo, poolAddress, decimals) {
    let [ quoteDec, baseDec ] = decimals 
    let poolInfo = await dodo.fetchPoolState(poolAddress)
    let converted = convertObjectWithBigNumberToNumber(
        poolInfo, 
        {
            Q0: quoteDec, 
            Q: quoteDec, 
            i: quoteDec, 
            B0: baseDec, 
            B: baseDec
        }
    )
    return converted
}


async function findBaseShortage(forkBlock, delta) {
    const decimals = [ 6, 18 ]
    const poolAddress = '0x75c23271661d9d143DCb617222BC4BEc783eff34'  // WETH-USDC
    let forkProvider = getForkProvider(forkBlock)
    let dodoContract = getExchanges(forkProvider)['dodo']
    let poolInfo = await queryDodoPoolInfo(
        dodoContract,
        poolAddress, 
        decimals, 
    )
    if ((poolInfo.B0-poolInfo.B)>0) {
        console.log('Base shortage at block: ', forkBlock)
        console.log('B0: ', poolInfo.B0)
        console.log('B: ', poolInfo.B)
        process.exit(0)
    } else {
        console.log(`Tried block ${forkBlock}, no luck ...`)
    }
    await findBaseShortage(forkBlock+delta)
}

function getGssForTradeFunction(tradeFunction, upBound, precision) {
    upBound = upBound || 1e3
    precision = precision || 1e-3
    if (tradeFunction(precision)<0) {
        return 0
    }
    let gssOptimalAmount = gss.gssSync(
        x=>-tradeFunction(x),  // Function
        0, // Lower bound
        upBound/2, // Mid number
        upBound, // Upper bound
        precision, // Precision
    )
    return gssOptimalAmount
}

module.exports = {
    convertObjectWithBigNumberToNumber,
    getGssForTradeFunction,
    queryDodoPoolInfo,
    findBaseShortage,
    getForkProvider, 
}