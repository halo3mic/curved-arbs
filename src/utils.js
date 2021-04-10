const csvWriter = require('csv-write-stream')
const providers = require('./providers')
const instr = require('./instrMng')
const fetch = require('node-fetch')
const config = require('./config')
const ethers = require('ethers')
const gss = require('gss')
const fs = require('fs');


async function approveERC20ForDispatcher(provider, signer, spender, tokens) {
    let dispatcherContract = new ethers.Contract(config.DISPATCHER, config.ABIS['dispatcher'], signer)
    let tx = await dispatcherContract.populateTransaction.tokenAllowAll(tokens, spender)
    let response = await signer.sendTransaction(tx)
    return provider.waitForTransaction(response.hash)    
}

async function allowanceErc20(provider, token, owner, spender, convert) {
    let allowed = await provider.call({
        data: `0xdd62ed3e000000000000000000000000${owner.replace('0x', '')}000000000000000000000000${spender.replace('0x', '')}`,
        to: token
    }).then(b => parseInt(b, 16))
    if (convert) {
        dec = await instr.tknAddressMap(token)
        allowed /= 10**dec
    }
    return allowed
}

async function getErc20Balance(provider, token, holder, convert) {
    let balance = await provider.call({
        data: '0x70a08231000000000000000000000000' + holder.replace('0x', ''),
        to: token
    }).then(b => {
        return ethers.BigNumber.from(b)
    })
    if (convert) {
        dec = await instr.tknAddressMap(token)
        balance = parseFloat(ethers.utils.formatUnits(balance, dec))
    }
    return balance
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

function getGssForTradeFunction(tradeFunction, upBound, precision) {
    upBound = upBound || 1e3
    precision = precision || 1e-3
    // First check if even smallest unit would make an arb
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

async function submitBatchesToArcher({ethCall, senderAddress, signature}) {
    let request  = {
        method: 'POST',
        body:    JSON.stringify(ethCall),
        headers: { 
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json', 
            'X-Flashbots-Signature': senderAddress+':'+signature
        }
    }
    return fetch(config.ARCHER_BATCHES_URL, request)
        // .then(response => response.json())
        .catch(error => console.log("broadcastToArcher::error", error))
}

function unNormalizeUnits(num, dec) {
    return ethers.utils.parseUnits(
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

function logToCsv(data, path) {
    if (!Array.isArray(data)) {
        data = [data]
    }
    let writer = csvWriter()
    let headers = {sendHeaders: false}
    if (!fs.existsSync(path))
        headers = {headers: Object.keys(data[0])}
    writer = csvWriter(headers);
    writer.pipe(fs.createWriteStream(path, {flags: 'a'}));
    data.forEach(e => writer.write(e))
    writer.end()
}

async function fetchGasPrice(speed) {
    let speedOptions = [
        'fast', 
        'rapid', 
        'standard',
        'slow' 
    ]
    if (!speedOptions.includes(speed)) {
        throw new Error(`Speed option ${speed} unknown. \nPlease select from ${speedOptions.join(',')}.`)
    }
    const url = "https://www.gasnow.org/api/v3/gas/price";
    try {
      const result = await fetch(url)
      const jsonResult = await result.json()
      const option = jsonResult.data[speed].toString()
      let gasPrice = ethers.BigNumber.from(option)
      if (gasPrice.gt(config.GAS_PRICE_LIMIT)) {
          throw new Error('Gas price limit reached!')
      }
      return gasPrice
    }
    catch (error) {
      if (error.message.startsWith("invalid json response body")) {
      }
      else {
        console.log("fetchGasPrice::catch", error.message)
      }
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }  

module.exports = {
    convertObjectWithBigNumberToNumber,
    approveERC20ForDispatcher,
    convertTxDataToByteCode,
    getGssForTradeFunction,
    submitBatchesToArcher,
    unNormalizeUnits,
    getErc20Balance,
    getForkProvider, 
    allowanceErc20,
    fetchGasPrice, 
    logToCsv, 
    sleep,
}