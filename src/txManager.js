

function unNormalizeUnits(num, dec) {
    return ethers.utils.parseUnits(
        // ethers.utils.formatUnits(num, dec)
        num.toString(), dec
    )
}

/**
 * Helper function for submitting bytecode to Archer
 * @param {tx} tx 
 */
 function convertTxDataToByteCode(tx) {
    const txData = tx.data
    const dataBytes = ethers.utils.hexDataLength(txData);
    const dataBytesHex = ethers.utils.hexlify(dataBytes);
    const dataBytesPadded = ethers.utils.hexZeroPad(dataBytesHex, 32);

    return ethers.utils.hexConcat([
      tx.to, 
      dataBytesPadded, 
      txData
    ]).split('0x')[1]
}

function makeTradeFunction(steps) {
    let tradeFunction = (inputAmount) => {
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
    return tradeFunction
}

async function makeSteps(path) {
    let steps = []
    for (let i=0; i<path.pools.length; i++) {
        let pool = instrMng.poolIdMap[path.pools[i]]
        let tkns = path.tkns.slice(i, i+2)
        let exchange = EXCHANGES[pool.exchange]
        let poolData = await exchange.getPoolData(pool.id, true)
        let step = {
            poolId: pool.id, 
            tknOrder: tkns,
            exchange,
            poolData, 
        }
        steps.push(step)
    }
    return steps
}


async function makeTradeForOpp(opp) {
    let error = 0.05
    let path = instrMng.pathIdMap[opp.pathId]
    let pool, tkns, amountIn, ethVal
    let calldata = '0x'
    for (let i=0; i<path.pools.length; i++) {
        pool = instrMng.poolIdMap[path.pools[i]]
        tkns = path.tkns.slice(i, i+2).map(tId=>instrMng.tknIdMap[tId])
        tknAddresses = tkns.map(t=>t.address)

        amountIn = unNormalizeUnits(opp.pathAmounts[i]*(1-error*i), tkns[0].decimal)
        amountOut = unNormalizeUnits(opp.pathAmounts[i+1]*(1-error), tkns[1].decimal)

        let step = {
            poolPath: [pool.address],
            tknPath: tknAddresses,
            to: opp.from,
            amountOut, 
            amountIn, 
        }
        txPayload = await EXCHANGES[pool.exchange].makeTrade(step, opp.wethEnabled)
        console.log(txPayload)
        ethVal = i==0 ? txPayload.value : ethVal
        calldata += convertTxDataToByteCode(txPayload)
    }
    return { calldata, ethVal }
}