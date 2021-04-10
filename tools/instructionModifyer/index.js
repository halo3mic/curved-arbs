
const fs = require('fs')
const resolve = require('path').resolve
const pools = require('../../config/pools.json')

function changeGas() {
    let deltaGas = '37292'  // Unwrapping cost
    let dstInstrPath = resolve(`${__dirname}/../../config/paths.json`) 
    let srcInstrPath = resolve(`${__dirname}/../../config/paths.json`) 
    let currData = getCurrentData(srcInstrPath)
    let modified = currData.map(e => {
        e.gasAmount = '300000'
        return e
    })
    save(modified, dstInstrPath)
}

function changeX() {
    let dstInstrPath = resolve(`${__dirname}/../../config/paths.json`) 
    let srcInstrPath = resolve(`${__dirname}/../../config/paths.json`) 
    let currData = getCurrentData(srcInstrPath)
    let modified = currData.filter(e => {
        return e.pools.length <= 3
    })
    save(modified, dstInstrPath)
}

function disablePathsForPool(poolId) {
    let dstInstrPath = resolve(`${__dirname}/../../config/paths.json`) 
    let srcInstrPath = resolve(`${__dirname}/../../config/paths.json`) 
    let currData = getCurrentData(srcInstrPath)
    let modified = currData.filter(p => !p.pools.includes(poolId))
    save(modified, dstInstrPath)
}

// function enablePathsForPools(enablePools) {
//     let dstInstrPath = resolve(`${__dirname}/../../config/paths.json`) 
//     let srcInstrPath = resolve(`${__dirname}/../../config/paths.json`) 
//     let currData = getCurrentData(srcInstrPath)
//     let modified = currData.filter(p => {
//         p.pools.map(p1 => {
//             !enablePools.includes(p1)
//         })
//     })
//     save(modified, dstInstrPath)
// }

function removePathsForToken(tknId) {
    let dstInstrPath = resolve(`${__dirname}/../../config/paths.json`) 
    let srcInstrPath = resolve(`${__dirname}/../../config/paths.json`) 
    let currData = getCurrentData(srcInstrPath)
    let modified = currData.filter(p => !p.tkns.includes(tknId))
    save(modified, dstInstrPath)
}

function removePoolsForTOken(tknId) {
    let dstInstrPath = resolve(`${__dirname}/../../config/pools.json`) 
    let srcInstrPath = resolve(`${__dirname}/../../config/pools.json`) 
    let currData = getCurrentData(srcInstrPath)
    let modified = currData.filter(p => !p.tkns.map(t=>t.id).includes(tknId))
    save(modified, dstInstrPath)
    removePathsForToken(tknId)
}

function removeToken(tknId) {
    let dstInstrPath = resolve(`${__dirname}/../../config/tokens.json`) 
    let srcInstrPath = resolve(`${__dirname}/../../config/tokens.json`) 
    let currData = getCurrentData(srcInstrPath)
    let modified = currData.filter(t=>!(t.id==tknId))
    save(modified, dstInstrPath)
    removePoolsForTOken(tknId)
    removePathsForToken(tknId)
}

function getCurrentData(path) {
    return JSON.parse(fs.readFileSync(path, 'utf8'))
}

function save(data, path) {
    try {
        fs.writeFileSync(path, JSON.stringify(data, null, 4))
        return true
    } catch(e) {
        console.log('Couldnt save!')
        console.log(e)
        return 
    }
}

function disableExchange(exchange) {
    let dstInstrPath = resolve(`${__dirname}/../../config/pools.json`) 
    let srcInstrPath = resolve(`${__dirname}/../../config/pools.json`) 
    let currData = getCurrentData(srcInstrPath)
    let modified = currData.filter(p => p.exchange!=exchange)
    save(modified, dstInstrPath)
    currData.filter(p => p.exchange==exchange).forEach(pool=>disablePathsForPool(pool.id))
}

function main() {
    let tknToRemove = [
        'T0028', // PHOON
        'T0009',   // SIL
        'T0012',  // AMPL
    ]
    tknToRemove.forEach(t=>removeToken(t))
}

function simpleTknsForPools() {
    let dstInstrPath = resolve(`${__dirname}/../../config/pools.json`) 
    let srcInstrPath = resolve(`${__dirname}/../../config/pools.json`) 
    let currData = getCurrentData(srcInstrPath)
    let modified = currData.map(e => {
        e.tkns = e.tkns.map(t => t.id ? t.id : t)
        return e
    })
    save(modified, dstInstrPath)
}

simpleTknsForPools()
// disableExchange('sakeswap')