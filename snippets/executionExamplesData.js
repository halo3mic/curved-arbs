

const example1 = {
    path: {
        "id": "I00000",
        "symbol": "weth=>usdc=>weth_dodo=>uniswap",
        "tkns": [
            "T0000",
            "T0001",
            "T0000"
        ],
        "pools": [
            "P0000",
            "P0001"
        ],
        "enabled": true,
        "gasAmount": "300000"
    },
    pools: [
        {
            "address": "0x75c23271661d9d143DCb617222BC4BEc783eff34",
            "fee": 0.003,
            "tkns": [
                'T0000', 
                'T0001'
            ],
            "symbol": "ethusdc_dodo",
            "exchange": "dodo",
            "id": "P0000"
        },
        {
            "address": "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc",
            "fee": 0.003,
            "tkns": [
                'T0001', 
                'T0000'
            ],
            "symbol": "ethusdc_dodo",
            "exchange": "uniswap",
            "id": "P0001"
        }
    ],
    tokens: [
        {
            "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            "symbol": "WETH",
            "decimal": "18",
            "id": "T0000"
        },
        {
            "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            "symbol": "USDC",
            "decimal": "6",
            "id": "T0001"
        }
    ]
}

module.exports = { 
    example1 
}