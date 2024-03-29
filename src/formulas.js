const ethers = require('ethers')
const bn = require('bignumber.js')

let d1000 = ethers.BigNumber.from("1000");
let d995 = ethers.BigNumber.from("995");

function baseShortageSellBase(baseAmount, pool){
    return pool.i*baseAmount*(1-pool.k+pool.k*((pool.B0**2)/(pool.B*(baseAmount+pool.B))))*(1-pool.lpFee)
}

function baseShortageBuyBase(baseAmount, pool) {
    baseAmount *= -(1-pool.lpFee)
    return -pool.i*baseAmount*(1-pool.k+pool.k*((pool.B0**2)/(pool.B*(baseAmount+pool.B))))
}

function quoteShortageSellBase(baseAmount, pool){
    let a = 1-pool.k;
    let b = ((pool.k*pool.Q0**2)/pool.Q)-pool.Q+pool.k*pool.Q+pool.i*baseAmount;
    let c = -pool.k*pool.Q0**2

    return (pool.Q-((-b+(b**2-4*a*c)**(1/2))/(2*a)))*(1-pool.lpFee)
}

function quoteShortageBuyBase(baseAmount, pool) {
    baseAmount *= -(1+pool.lpFee)
    let a = 1-pool.k;
    let b = ((pool.k*pool.Q0**2)/pool.Q)-pool.Q+pool.k*pool.Q-pool.i*baseAmount;
    let c = -pool.k*pool.Q0**2

    return (pool.Q-((-b+(b**2-4*a*c)**(1/2))/(2*a)))
}

function baseShortageSellQuote(quoteAmount, pool){
    let a = 1-pool.k;
    let b = ((pool.k*pool.B0**2)/pool.B)-pool.B+pool.k*pool.B-(-quoteAmount/pool.i);
    let c = -pool.k*pool.B0**2

    return (pool.B-((-b+(b**2-4*a*c)**(1/2))/(2*a)))*(1-pool.lpFee)
}

function baseShortageBuyQuote(quoteAmount, pool) {
    quoteAmount *= -(1+pool.lpFee)
    let a = 1-pool.k
    let b = ((pool.k*pool.B0**2)/pool.B)-pool.B+pool.k*pool.B-(quoteAmount/pool.i);
    let c = -pool.k*pool.B0**2

    return (pool.B-((-b+(b**2-4*a*c)**(1/2))/(2*a)))
}

function quoteShortageSellQuote(quoteAmount, pool) {
    return (quoteAmount/pool.i)*(1-pool.k+pool.k*((pool.Q0**2)/(pool.Q*(quoteAmount+pool.Q))))*(1-pool.lpFee)
}

function quoteShortageBuyQuote(quoteAmount, pool) {
    quoteAmount *= -(1+pool.lpFee)
    return -(quoteAmount/pool.i)*(1-pool.k+pool.k*((pool.Q0**2)/(pool.Q*(quoteAmount+pool.Q))))
}

function calcAmountOut(amountIn, reserveIn, reserveOut) {
    const fee = 0.003
    let taxedIn = amountIn * (1-fee)
    let numerator = taxedIn * reserveOut
    let denominator = reserveIn + taxedIn
    return numerator / denominator
}

const formulasMap = {
    baseShortage: {
        buyQuote: baseShortageBuyQuote, 
        buyBase: baseShortageBuyBase, 
        sellQuote: baseShortageSellQuote, 
        sellBase: baseShortageSellBase
    }, 
    quoteShortage: {
        buyQuote: quoteShortageBuyQuote, 
        buyBase: quoteShortageBuyBase, 
        sellQuote: quoteShortageSellQuote, 
        sellBase: quoteShortageSellBase
    }
}

module.exports = { 
    dodo: {
        quoteShortageSellQuote,
        quoteShortageBuyQuote,
        baseShortageSellQuote, 
        quoteShortageSellBase, 
        baseShortageSellBase,
        baseShortageBuyQuote, 
        quoteShortageBuyBase, 
        baseShortageBuyBase,
        formulasMap
    }, 
    uniswap: {
        calcAmountOut
    }
}
