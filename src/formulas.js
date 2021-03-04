
function baseShortageSellBase(baseAmount, pool){
    //f1
    return -pool.i*baseAmount*(1-pool.k+pool.k*((pool.B0**2)/(pool.B*(baseAmount+pool.B))));
}

function baseShortageBuyBase(baseAmount, pool) {
    return baseShortageSellBase(-baseAmount, pool)
}

function quoteShortageSellBase(baseAmount, pool){
    //f2
    let a = 1-pool.k;
    let b = ((pool.k*pool.Q0**2)/pool.Q)-pool.Q+pool.k*pool.Q-pool.i*baseAmount;
    let c = -pool.k*pool.Q0**2

    return pool.Q-((-b+(b**2-4*a*c)**(1/2))/(2*a))
}

function quoteShortageBuyBase(baseAmount, pool) {
    return quoteShortageSellBase(-baseAmount, pool)
}

function baseShortageSellQuote(quoteAmount, pool){
    //f3
    let a = 1-pool.k;
    let b = ((pool.k*pool.B0**2)/pool.B)-pool.B+pool.k*pool.B-(quoteAmount/pool.i);
    let c = -pool.k*pool.B0**2

    return pool.B-((-b+(b**2-4*a*c)**(1/2))/(2*a))
}

function baseShortageBuyQuote(baseAmount, pool) {
    return baseShortageSellQuote(-baseAmount, pool)
}


function quoteShortageSellQuote(quoteAmount, pool){
    //f4
    return -(quoteAmount/pool.i)*(1-pool.k+pool.k*((pool.Q0**2)/(pool.Q*(quoteAmount+pool.Q))));
}

function quoteShortageBuyQuote(baseAmount, pool) {
    return quoteShortageSellQuote(-baseAmount, pool)
}

function calcAmountOut(amountIn, reserveIn, reserveOut) {
    const fee = 0.003
    let taxedIn = amountIn * (1-fee)
    let numerator = taxedIn * reserveOut
    let denominator = reserveIn + taxedIn
    return numerator / denominator
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
    }, 
    uniswap: {
        calcAmountOut
    }
}
