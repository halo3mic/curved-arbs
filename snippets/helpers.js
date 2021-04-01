

async function approveErc20(signer, token, spender, amount) {
    const amountHex = amount ? amount.toString(16).replace('0x', '') : 'f'.repeat(64)
    const calldata = `0x095ea7b3000000000000000000000000${spender.replace('0x', '')}${amountHex}`
    return signer.sendTransaction({
        to: token, 
        data: calldata
    })
}
