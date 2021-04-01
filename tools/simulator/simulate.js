const tokens = require('../../config/tokens.json')
const paths = require('../../config/paths.json')
const pools = require('../../config/pools.json')
const provider = require('../../provider')
const config = require('../../config')
const { getExchanges } = require('../../exchanges')
const ethers = require('ethers')
const path = require('path')
const fs = require('fs')

const ACCOUNTS_PATH = './accounts.json'
let EXCHANGES = getExchanges()
let PROVIDER
let SIGNER

function fetchTestAccount() {
    let activeAccounts = require(ACCOUNTS_PATH)
    return Object.keys(activeAccounts.addresses)[0]
}

function connectToGancheProvider(args) {
    const absPath = path.resolve(`${__dirname}/${ACCOUNTS_PATH}`)
    let ganacheArgs = {
        default_balance_ether: ethers.utils.parseEther('11000'), 
        account_keys_path: absPath, 
    }
    ganacheArgs = {...ganacheArgs, ...args}
    return provider.setGancheProvider(ganacheArgs)
}

async function getWrappedBalance() {
    let wrappedTokenAddress = tokens.filter(
        t => t.id=='T0000'
    )[0].address 
    let wrapContract = new ethers.Contract(
        wrappedTokenAddress, 
        config.ABIS['weth'], 
        SIGNER
    )
    return wrapContract.balanceOf(SIGNER._address)
}

async function wrapChainToken(amount) {
    let wrappedTokenAddress = tokens.filter(
        t => t.id=='T0000'
    )[0].address 
    console.log(wrappedTokenAddress)
    let wrapContract = new ethers.Contract(
        wrappedTokenAddress, 
        config.ABIS['weth'], 
        SIGNER
    )
    let txWrap = await wrapContract.deposit({ value: amount })
    let txApprove = await wrapContract.approve(config.ROUTER_ADDRESS, amount)
    return Promise.all([
        PROVIDER.waitForTransaction(txWrap.hash),
        PROVIDER.waitForTransaction(txApprove.hash)
    ])
}

async function tradeTokensToTokens(path, tradeAmount) {
    let dexContract = new ethers.Contract(
        config.ROUTER_ADDRESS, 
        config.ABIS['uniswapRouter'], 
        SIGNER
    )
    let tknAddressPath = path.tkns.map(t1=>tokens.filter(t2=>t2.id==t1)[0].address)
    let tx = await dexContract.swapExactTokensForTokens(
        tradeAmount,
        ethers.constants.Zero,
        tknAddressPath,
        SIGNER._address,
        Date.now()+180
    )
    return PROVIDER.waitForTransaction(tx.hash);
}


async function tradeEthToTokens(path, tradeAmount) {
    let exchange = EXCHANGES[pools.filter(pool=>pool.id==path.pools[0])[0].exchange]
    let dexContract = new ethers.Contract(
        exchange.routerAddress, 
        config.ABIS['uniswapRouter'], 
        SIGNER
    )
    let tknAddressPath = path.tkns.map(t1=>tokens.filter(t2=>t2.id==t1)[0].address)
    let tx = await dexContract.swapExactETHForTokens(
        ethers.constants.Zero,
        tknAddressPath,
        SIGNER._address,
        Date.now()+180, 
        {value: tradeAmount}
    )
    return PROVIDER.waitForTransaction(tx.hash);
}


async function getTradeTokensToTokens(path, tradeAmount) {
    let dexContract = new ethers.Contract(
        config.ROUTER_ADDRESS, 
        config.ABIS['uniswapRouter'], 
        SIGNER
    )
    let tknAddressPath = path.tkns.map(t1=>tokens.filter(t2=>t2.id==t1)[0].address)
    let tx = await dexContract.populateTransaction.swapExactTokensForTokens(
        tradeAmount,
        ethers.constants.Zero,
        tknAddressPath,
        SIGNER._address,
        Date.now()+180
    )
    return tx
}

function updateGasEstimate(pathId, newEstimate) {
    let pathToFile = '../../config/paths.json'
    const absPath = path.resolve(`${__dirname}/${pathToFile}`)
    let modified = paths.map(path => {
        path.gasAmount = path.id==pathId ? newEstimate : path.gasAmount
        return path
    })
    try {
        fs.writeFileSync(absPath, JSON.stringify(paths, null, 4))
        console.log('Gas amount updated!')
        return true
    } catch(e) {
        console.log('Couldnt save!')
        console.log(e)
        return 
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
} 

async function estimateGasAmount() {
    PROVIDER = connectToGancheProvider()
    let testAccount = fetchTestAccount()
    SIGNER = PROVIDER.getSigner(testAccount)
    
    let testPaths = paths.filter(p=>p.gasAmount==300000 && p.enabled) // Only run instructions that still have default gas amount value
    let wrapAmount = ethers.utils.parseEther('11000')
    let tradeAmount = ethers.utils.parseEther('1')
    try {
        await wrapChainToken(wrapAmount).then(()=>console.log('Wrapping finished!'))
    } catch (e) {
        console.log(e)
    }
    for (let path of testPaths) {
        try {
            let tx = getTradeTokensToTokens(path, tradeAmount)
            let gasUsed = await PROVIDER.estimateGas(tx).then(tx=>tx.toString())
            updateGasEstimate(path.id, gasUsed)
            console.log(`Gas estimate for ${path.id}: ${gasUsed}`)
            // await sleep(2)
        } catch {
            console.log(`Path ${path.id} failed to execute trade tx!`)
        }
    }
}

async function simulateCrossDexTrade() {
    
}

async function simulateArcherTx(blockNumber, makeTradeArgs) {
    let fork = `${provider.ws.endpoint}@${blockNumber-1}`
    let unlocked_accounts = [config.CLIENT]
    PROVIDER = connectToGancheProvider({fork, unlocked_accounts})
    SIGNER = PROVIDER.getSigner(config.CLIENT)

    let dispatcher = new ethers.Contract(
        config.DISPATCHER, 
        config.ABIS['dispatcher'], 
        SIGNER
    )
    let tx = await dispatcher['makeTrade(bytes,uint256)'](...makeTradeArgs)
    return tx
}

async function simulateTx1() {
    let forkBlock = 11984773
    let tradeTx = '0xceb90e4c17d626be0facd78b79c9c87d7ca181b300000000000000000000000000000000000000000000000000000000000000e47ff36ab500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000d30ce37a6f2424593dabe9b712d235781815445d00000000000000000000000000000000000000000000000000000000604371e80000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000a0b73e1ff0b80914ab6fe0444e65848c4c34450bceb90e4c17d626be0facd78b79c9c87d7ca181b3000000000000000000000000000000000000000000000000000000000000010438ed1739000000000000000000000000000000000000000000000000000002303212503d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000d30ce37a6f2424593dabe9b712d235781815445d00000000000000000000000000000000000000000000000000000000604371e80000000000000000000000000000000000000000000000000000000000000002000000000000000000000000a0b73e1ff0b80914ab6fe0444e65848c4c34450b000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7d9e1ce17f2641f24ae83637ab66a2cca9c378b9f000000000000000000000000000000000000000000000000000000000000010418cbafe500000000000000000000000000000000000000000000000000000000da6c24ec000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000d30ce37a6f2424593dabe9b712d235781815445d00000000000000000000000000000000000000000000000000000000604371e80000000000000000000000000000000000000000000000000000000000000002000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
    let inputAmount = '0x2086dcb74cc72eb4'
    let makeTradeArgs = [tradeTx, inputAmount]
    let tx = await simulateArcherTx(forkBlock, makeTradeArgs).catch(console.log)
    console.log('Balance before: ', ethers.utils.formatEther(await PROVIDER.getBalance(config.DISPATCHER)))
    let receipt = await PROVIDER.waitForTransaction(tx.hash)
    console.log(receipt)
    console.log('Balance after in weth: ', ethers.utils.formatEther(await getWrappedBalance()))
    console.log('Balance after: ', ethers.utils.formatEther(await PROVIDER.getBalance(config.DISPATCHER)))
}

async function simulateChainTrade() {
    let forkBlock = 11982314
    let inputAmount = '2557294033715948847'
    let fork = `${provider.ws.endpoint}@${forkBlock-1}`
    let unlocked_accounts = [config.DISPATCHER]
    PROVIDER = connectToGancheProvider({fork, unlocked_accounts})
    SIGNER = PROVIDER.getSigner(config.DISPATCHER)

    let path = paths.filter(path=>path.id=='I01426')[0]
    console.log('Balance before: ', ethers.utils.formatEther(await PROVIDER.getBalance(config.DISPATCHER)))
    let tx = await tradeEthToTokens(path, inputAmount)
    console.log(`Tx succesful? ${tx.status==1}`)
    console.log('Balance after in weth: ', ethers.utils.formatEther(await getWrappedBalance()))
    console.log('Balance after: ', ethers.utils.formatEther(await PROVIDER.getBalance(config.DISPATCHER)))
}

async function simulateSignedTx() {
    let txBytes = '0xf9034b80851fe5d61fb38307a12094d30ce37a6f2424593dabe9b712d235781815445d80b902e4e7abbb220000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000340386edd86e93c40000000000000000000000000000000000000000000000000000000000b7dcc300000000000000000000000000000000000000000000000000000000000002507a250d5630b4cf539739df2c5dacb4c659f2488d00000000000000000000000000000000000000000000000000000000000000e47ff36ab500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000d30ce37a6f2424593dabe9b712d235781815445d000000000000000000000000000000000000000000000000000000006050a4ae0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000001337def16f9b486faed0293eb623dc8395dfe46ad9e1ce17f2641f24ae83637ab66a2cca9c378b9f000000000000000000000000000000000000000000000000000000000000010418cbafe5000000000000000000000000000000000000000000000245194eb02e45aa4c3a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000d30ce37a6f2424593dabe9b712d235781815445d000000000000000000000000000000000000000000000000000000006050a4ae00000000000000000000000000000000000000000000000000000000000000020000000000000000000000001337def16f9b486faed0293eb623dc8395dfe46a000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000001ca05f84ffac861730dd426be9017c9ca2cfc0ea43a3b653556ae62a1ee33bd6198da075c9df458a9ec7ac5b343982ecedd2220dbe2692fb07b972055a4fde166d37f2'
    let targetBlock = parseInt('0xb7dcc5', 16)

    let fork = `${provider.ws.endpoint}@${targetBlock-1}`
    let unlocked_accounts = [config.TRADER]
    PROVIDER = connectToGancheProvider({fork, unlocked_accounts})
    SIGNER = PROVIDER.getSigner(config.TRADER)
    try {
        let tx = await PROVIDER.send(
            'eth_sendRawTransaction', 
            [txBytes]
        )
        let txReceipt = await PROVIDER.waitForTransaction(tx)
        console.log(txReceipt)
        // console.log(Object.keys(txReceipt))
    } catch (e) {
        // fs.writeFileSync("./batchesTx1.txt", JSON.stringify(e, null, 4));
        console.log(e)
    }
    console.log('Done')
}

simulateSignedTx()