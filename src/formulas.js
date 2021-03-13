const { calcQuad } = require('./utils');

function baseShortageSellBase(baseAmount, pool){
    //f1
    let outAmount;

    if (baseAmount<pool.B0-pool.B) { // base amount is below equilibrium
        //f1.1
        outAmount = pool.i*baseAmount*(1-pool.k+pool.k*((pool.B0**2)/(pool.B*(baseAmount+pool.B))));
        if (outAmount>pool.Q-pool.Q0) { // corner case detailed in DODO's contract logic
            console.log('since receive quote is ',outAmount);
            outAmount = pool.Q-pool.Q0;
            console.log('and that\'s bigger than it should, we force receive quote to :', outAmount);
        }
    } else if (baseAmount>pool.B0-pool.B) { // base amount is above equilibrium
        //f1.3
        let a = (1-pool.k);
        let b = (2*pool.k-1)*pool.Q0+pool.i*(baseAmount-pool.B0+pool.B);
        let c = (-pool.k*(pool.Q0**2));
        outAmount = pool.Q - calcQuad(a,b,c);
    } else {
        //f1.2
        outAmount = pool.Q - pool.Q0;
    }

    return outAmount*(1-pool.lpFee)
}

function baseShortageBuyBase(baseAmount, pool) {
    let amount = baseAmount*(1+pool.lpFee)
    return (pool.i*amount*(1-pool.k+pool.k*((pool.B0**2)/(pool.B*(pool.B-amount)))));

}

function quoteShortageSellBase(baseAmount, pool){
    console.log(`Calculating quote shortage for selling ${baseAmount} of base tokens`);
    //f2
    let a = 1-pool.k;
    let b = ((pool.k*(pool.Q0**2))/pool.Q)-pool.Q+pool.k*pool.Q-pool.i*baseAmount;
    let c = -pool.k*(pool.Q0**2)

    return (calcQuad(a,b,c)-pool.Q)*(1-pool.lpFee)
}

function quoteShortageBuyBase(baseAmount, pool) {
    //f4
    return quoteShortageSellQuote(baseAmount, pool) //for now, we link to f4. idk what to do with buy-base or buy-quote
}

function baseShortageSellQuote(quoteAmount, pool){
    //f3
    let a = 1-pool.k;
    let b = ((pool.k*pool.B0**2)/pool.B)-pool.B+pool.k*pool.B-(quoteAmount*pool.i);
    let c = -pool.k*pool.B0**2

    return (pool.B-calcQuad(a,b,c))*(1-pool.lpFee)
}

function baseShortageBuyQuote(baseAmount, pool) {
    //f1
    return baseShortageSellBase(baseAmount, pool)
}

function quoteShortageSellQuote(quoteAmount, pool){
    //f4
    let outAmount;
    if (quoteAmount<pool.Q0-pool.Q) {
        outAmount = -(quoteAmount/pool.i)*(1-pool.k+pool.k*((pool.Q0**2)/(pool.Q*(quoteAmount+pool.Q))));
    } else if (quoteAmount>pool.Q0-pool.Q) {
        let a = (1-pool.k);
        let b = (2*pool.k-1)*pool.B0+((quoteAmount-pool.Q0+pool.Q)/(pool.i));
        let c = (-pool.k*(pool.Q0**2));
        outAmount = pool.B - calcQuad(a,b,c);
    } else {
        outAmount = pool.B - pool.B0
    }

    return outAmount * (1-pool.lpFee)

    
}

function quoteShortageBuyQuote(baseAmount, pool) {
    //f2
    return quoteShortageSellBase(baseAmount, pool)
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
