async function getErc20Balance(provider, token, holder, convert) {
    let balance = await provider.call({
        data: '0x70a08231000000000000000000000000' + holder.replace('0x', ''),
        to: token
    }).then(b => {
        // console.log(b)
        return ethers.BigNumber.from(b)}
    )
    if (convert) {
        dec = await getErc20Decimals(provider, token)
        balance = parseFloat(ethers.utils.formatUnits(balance, dec))
    }
    return balance
}

async function approveErc20(signer, token, spender, amount) {
    const amountHex = amount ? amount.toString(16).replace('0x', '') : 'f'.repeat(64)
    const calldata = `0x095ea7b3000000000000000000000000${spender.replace('0x', '')}${amountHex}`
    return signer.sendTransaction({
        to: token, 
        data: calldata
    })
}
