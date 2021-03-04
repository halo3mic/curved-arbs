const formulas = require('../src/formulas')
const gss = require('gss').gssSync


function getGssForTradeFunction(tradeFunction, absBound) {
    let lowBound = -absBound
    let upBound = absBound
    let gssOptimalAmount = gss(
        x=>-tradeFunction(x),  // Function
        lowBound, // Lower bound
        (upBound+lowBound)/2, // Mid number
        upBound, // Upper bound
        1e-5, // Precision
    )
    return gssOptimalAmount
}


/**
 * Test case for optimal amount in following setting:
 *      - Uniswap --> Dodo
 *      - base shortage
 *      - sell base
 * Swap USDC for ETH on Uniswap and then swap ETH for USDC on Dodo
 * Optimal amount is obtained from Desmos graph (https://www.desmos.com/calculator/pmswbygoy4)

 */
function case1() {
    console.log('^'.repeat(50))
    console.log('CASE#1')

    let tradeFunction = (inputAmount, logToConsole) => {
        // Uniswap trade
        let uniswapAmountOut = formulas.uniswap.calcAmountOut(
            inputAmount, 
            uniswapPoolInfo.R0, 
            uniswapPoolInfo.R1
        )
        // Sell amount recieved from Uniswap on Dodo
        let dodoAmountOut = -formulas.dodo.quoteShortageSellBase(
            uniswapAmountOut, 
            dodoPoolInfo
        )
        if (logToConsole) {
            console.log('^'.repeat(60))
            console.log(`Input amount: ${inputAmount} | Is optimal: ${inputAmount==optimalAmount}`)
            console.log(`Uniswap amount out: ${uniswapAmountOut} | Price: ${inputAmount/uniswapAmountOut}`)
            console.log(`Dodo amount out: ${dodoAmountOut} | Price: ${dodoAmountOut/uniswapAmountOut}`)
            console.log('Profit: ', dodoAmountOut-inputAmount)
        }
        return dodoAmountOut-inputAmount
    }
    const dodoPoolInfo = {
        i: 1629,
        k: 0.8,
        Q0: 12507289,
        Q: 12564433, 
        B0: 8163, 
        B: 8128
    }
    const uniswapPoolInfo = {
        R1: 400,
        R0: 600000,
    }    
    const absBound = 1e5
    const optimalAmount = getGssForTradeFunction(tradeFunction, absBound)

    const testPrecision = 0.01  // Test the trade X% above and below optimal amount 
    let inputAmounts = [
        optimalAmount*(1-testPrecision),
        optimalAmount, 
        optimalAmount*(1+testPrecision), 
    ]
    inputAmounts.forEach(inputAmount => tradeFunction(inputAmount, true))
}

/**
 * Test case for optimal amount in following setting:
 *      - Dodo --> Uniswap
 *      - base shortage
 *      - sell base
 * Swap ETH for USDC on Dodo and then swap USDC for ETH on Uniswap 
 * Optimal amount is obtained from Desmos graph (https://www.desmos.com/calculator/7hkubrlsiz)
 */
function case2() {
    console.log('^'.repeat(50))
    console.log('CASE#2')

    let tradeFunction = (inputAmount, logToConsole) => {
        // Dodo swap
        let dodoAmountOut = -formulas.dodo.quoteShortageSellBase(
            inputAmount, 
            dodoPoolInfo
        )
        // Uniswap swap
        let uniswapAmountOut = formulas.uniswap.calcAmountOut(
            dodoAmountOut, 
            uniswapPoolInfo.R0, 
            uniswapPoolInfo.R1
        )
        if (logToConsole) {
            console.log('^'.repeat(60))
            console.log(`Input amount: ${inputAmount} | Is optimal: ${inputAmount==optimalAmount}`)
            console.log(`Dodo amount out: ${dodoAmountOut} | Price: ${dodoAmountOut/uniswapAmountOut}`)
            console.log(`Uniswap amount out: ${uniswapAmountOut} | Price: ${inputAmount/uniswapAmountOut}`)
            console.log('Profit: ', uniswapAmountOut-inputAmount)
        }
        return uniswapAmountOut-inputAmount
    }
    const dodoPoolInfo = {
        i: 1629,
        k: 0.8,
        Q0: 12507289,
        Q: 12564433, 
        B0: 8163, 
        B: 8128
    }
    const uniswapPoolInfo = {
        R1: 400,
        R0: 600000,
    }    
    const optimalAmount = getGssForTradeFunction(tradeFunction, 1e2)

    const testPrecision = 0.01  // Test the trade X% above and below optimal amount 
    let inputAmounts = [
        optimalAmount*(1-testPrecision),
        optimalAmount, 
        optimalAmount*(1+testPrecision), 
    ]
    inputAmounts.forEach(inputAmount => tradeFunction(inputAmount, true))
}

function main() {
    let allMethods = {
        case1, 
        case2
    }
    let methods = process.argv.filter(arg => arg.startsWith('--')).map(arg=>arg.slice(2))
    if (methods.length==0) {
        Object.values(allMethods).forEach(method => method())
    } else {
        methods.forEach(methodName => allMethods[methodName]())
    }
}

main()