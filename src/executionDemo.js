
async function approveForAll(provider, signer, spenderTknsMap) {
    for (let spender of Object.keys(spenderTknsMap)) {
        await approveERC20ForDispatcher(
            provider, 
            signer, 
            spender, 
            spenderTknsMap[spender]
        )
    }
    return true
}


async function findOptimalForPathGSS() {
    // https://etherscan.io/tx/0x9d4c70621f18460cc0cb416e48c388ccc6661663ec71e6e78958ca50580bfd17
    let forkBlock = 11907345
    let gp = utils.getForkProvider(forkBlock)
    EXCHANGES = getExchanges(gp)
    let path = instrMng.paths[1]
    let steps = await makeSteps(path)
    let tradeFunction = makeTradeFunction(steps)
    let maxInputAmount = 1e3  // TODO make max input amount the min of reserves for all pools involved
    let optimalAmount = utils.getGssForTradeFunction(tradeFunction, maxInputAmount)
    console.log('Optimal in: ', optimalAmount)
    console.log('Profit: ', tradeFunction(optimalAmount))  
}


async function testApprovals() {
    let forkBlock = 11907345
    let clientAddress = '0x103c7BEC38a948b738A430B2b685654dd95bE0A5'
    let dispatcher = '0xD30Ce37a6F2424593DaBe9b712d235781815445D'
    let unlocked_accounts = [clientAddress]
    let gp = utils.getForkProvider(forkBlock, {unlocked_accounts})
    let signer = gp.getSigner(clientAddress)
    let tknsToApproveForSpenders = {
        '0xa356867fDCEa8e71AEaF87805808803806231FdC': [
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
        ]
    }
    let s = '0xa356867fDCEa8e71AEaF87805808803806231FdC'
    let tkns = tknsToApproveForSpenders[s]
    await approveERC20ForDispatcher(gp, signer, s, tkns)
    console.log(tkns)
    let a = await allowanceErc20(gp, tkns[0], dispatcher, s, false)
    console.log(a)
}

async function executeTradesViaDispatcherSeperate() {
    let approver = '0x103c7BEC38a948b738A430B2b685654dd95bE0A5'
    let dispatcherAddress = '0xD30Ce37a6F2424593DaBe9b712d235781815445D'
    let usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    let tknsToApproveForSpenders = {
        '0xCB859eA579b28e02B87A1FDE08d087ab9dbE5149': [
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
        ]
    }
    let forkBlock = 11907345
    let unlocked_accounts = [dispatcherAddress, approver]
    let gp = utils.getForkProvider(forkBlock, {unlocked_accounts})
    let signer = gp.getSigner(dispatcherAddress)
    let signerApprover = gp.getSigner(approver)
    
    EXCHANGES = getExchanges(gp)
    await approveForAll(gp, signerApprover, tknsToApproveForSpenders)
    let txs = [
        {
            data: '0x7ff36ab50000000000000000000000000000000000000000000000000000000fa57e5e140000000000000000000000000000000000000000000000000000000000000080000000000000000000000000d30ce37a6f2424593dabe9b712d235781815445d0000000000000000000000000000000000000000000000000000000060478fb90000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            to: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
            value: '0x02394450aaae860000'
        },
        {
            data: '0x0dd4ebd9000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000000000000000000000000000000000000000000000000000fa57e5e14000000000000000000000000000000000000000000000002367599e378762c78000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006048e696000000000000000000000000000000000000000000000000000000000000000100000000000000000000000075c23271661d9d143dcb617222bc4bec783eff34',
            to: '0xa356867fDCEa8e71AEaF87805808803806231FdC',
        }
    ]
    try {
        console.log('Balance before:', await gp.getBalance(dispatcherAddress))
        let txResponse = await signer.sendTransaction(txs[0])
        let txReceipt = await gp.waitForTransaction(txResponse.hash)
        let tknBal = await getErc20Balance(gp, usdc, dispatcherAddress)
        let allowance = await allowanceErc20(gp, usdc, dispatcherAddress, config.DODO_APPROVE, false)
        // console.log(txReceipt)
        console.log(tknBal)
        console.log(allowance)
        let txResponse2 = await signer.sendTransaction(txs[1])
        let txReceipt2 = await gp.waitForTransaction(txResponse2.hash)
        // console.log(txReceipt2)
        console.log('Balance after:', await gp.getBalance(dispatcherAddress))
    } catch (e) {
        console.log(e)
    }
}

async function executeTradesViaDispatcherTogether() {
    let clientAddress = '0xa2cD5b9D50d19fDFd2F37CbaE0e880F9ce327837'
    let approver = '0x103c7BEC38a948b738A430B2b685654dd95bE0A5'
    let dispatcherAddress = '0xD30Ce37a6F2424593DaBe9b712d235781815445D'
    let tknsToApproveForSpenders = {
        '0xCB859eA579b28e02B87A1FDE08d087ab9dbE5149': [
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
        ]
    }
    let forkBlock = 11907345
    let unlocked_accounts = [clientAddress, approver]
    let gp = utils.getForkProvider(forkBlock, {unlocked_accounts})
    let signer = gp.getSigner(clientAddress)
    let signerApprover = gp.getSigner(approver)
    
    let dispatcherContract = new ethers.Contract(
        dispatcherAddress, 
        config.ABIS['dispatcher'], 
        signer
    )
    EXCHANGES = getExchanges(gp)
    await approveForAll(gp, signerApprover, tknsToApproveForSpenders)
        
    // let calldata = '0x7a250d5630b4cf539739df2c5dacb4c659f2488d00000000000000000000000000000000000000000000000000000000000000e47ff36ab50000000000000000000000000000000000000000000000000000000fa57e5e140000000000000000000000000000000000000000000000000000000000000080000000000000000000000000d30ce37a6f2424593dabe9b712d235781815445d000000000000000000000000000000000000000000000000000000006048e3470000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48a356867fdcea8e71aeaf87805808803806231fdc00000000000000000000000000000000000000000000000000000000000001440dd4ebd9000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000000000000000000000000000000000000000000000000000fa57e5e14000000000000000000000000000000000000000000000002367599e378762c78000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006048e347000000000000000000000000000000000000000000000000000000000000000100000000000000000000000075c23271661d9d143dcb617222bc4bec783eff34'
    // let ethVal = ethers.BigNumber.from('0x02394450aaae860000')
    let { calldata, ethVal } = await makeTradeForOppDemo()
    try {
        let txResponse = await dispatcherContract['makeTrade(bytes,uint256)'](calldata, ethVal)
        console.log(txResponse)
    } catch (e) {
        console.log(e)
    }
}

async function makeTradeForOppDemo() {
    let exampleOpp = { 
        oppId: '11907345I00001', 
        pathId: 'I00001',
        gasAmount: 340000, 
        profit: 0.204, 
        from: '0xD30Ce37a6F2424593DaBe9b712d235781815445D',
        pathAmounts: [41.02, 67879.83, 41.23],
        wethEnabled: false
    }
    let forkBlock = 11907345
    let dispatcher = '0xD30Ce37a6F2424593DaBe9b712d235781815445D'
    let unlocked_accounts = [dispatcher]
    let gp = utils.getForkProvider(forkBlock, {unlocked_accounts})
    let signer = gp.getSigner(dispatcher)
    EXCHANGES = getExchanges(gp)
    let opp = exampleOpp
    let { calldata, ethVal } = await makeTradeForOpp(opp)
    console.log(calldata)
    console.log(ethVal)
    return { calldata, ethVal }
}