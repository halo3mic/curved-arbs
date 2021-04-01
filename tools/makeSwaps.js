const tokens = require('../config/tokens.json')
const pools = require('../config/pools.json')
const tknIdMap = Object.fromEntries(tokens.map(t=>[t.id, t]))



let currentPairs = `
    uniswap_like_swap(WETH, USDC, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, DAI, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, ADEL, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, WBTC, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, CREAM, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, AAVE, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, AKRO, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, STRONG, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, KP3R, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, REN, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, COMP, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, UMA, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, YFI, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, BAL, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, SNX, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, CRV, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, ENJ, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, REPV2, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, KNC, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, ZRX, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, BAT, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, CVP, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, WNXM, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, MKR, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, UNI, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, LEND, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, LINK, UNISWAP_ROUTER),
    uniswap_like_swap(LINK, STRONG, UNISWAP_ROUTER),
    uniswap_like_swap(USDC, AKRO, UNISWAP_ROUTER),
    uniswap_like_swap(CREAM, KP3R, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, SRM, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, GNO, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, BAND, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, XOR, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, COVER, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, RENBTC, UNISWAP_ROUTER),
    uniswap_like_swap(USDC, RENBTC, UNISWAP_ROUTER),
    uniswap_like_swap(RENBTC, WBTC, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, HEGIC, UNISWAP_ROUTER),
    uniswap_like_swap(DAI, HEGIC, UNISWAP_ROUTER),
    uniswap_like_swap(DAI, USDC, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, YAM, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, YUSD, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, DMG, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, LRC, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, CRO, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, STAKE, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, YFL, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, OXT, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, INDEX, UNISWAP_ROUTER),
    uniswap_like_swap(INDEX, USDC, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, MARK, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, SYN, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, RARI, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, NMR, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, CRD, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, APY, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, DOUGH, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, HAKKA, UNISWAP_ROUTER),
    uniswap_like_swap(MKR, HAKKA, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, SEEN, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, COL, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, USDT, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, BADGER, UNISWAP_ROUTER),
    uniswap_like_swap(WBTC, BADGER, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, PICKLE, UNISWAP_ROUTER),
    uniswap_like_swap(USDT, LINA, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, YAX, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, CEL, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, GSWAP, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, ZUT, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, DRC, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, SUSD, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, VAL, UNISWAP_ROUTER),
    uniswap_like_swap(XOR, VAL, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, DG, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, MANA, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, SUSHI, UNISWAP_ROUTER),
    uniswap_like_swap(USDC, SUSHI, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, YETI, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, GRT, UNISWAP_ROUTER),
    uniswap_like_swap(GRT, USDC, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, RPL, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, SFI, UNISWAP_ROUTER),
    uniswap_like_swap(GEEQ, SFI, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, PNK, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, INCH, UNISWAP_ROUTER),
    uniswap_like_swap(INCH, DAI, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, ESD, UNISWAP_ROUTER),
    uniswap_like_swap(ESD, USDC, UNISWAP_ROUTER),
    uniswap_like_swap(ESD, SFI, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, DPI, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, FXS, UNISWAP_ROUTER),
    uniswap_like_swap(FXS, USDC, UNISWAP_ROUTER),
    uniswap_like_swap(FXS, FRAX, UNISWAP_ROUTER),
    uniswap_like_swap(FRAX, USDC, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, FRAX, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, PTF, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, FRMX, UNISWAP_ROUTER),
    uniswap_like_swap(FRMX, FRM, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, FRM, UNISWAP_ROUTER),
    uniswap_like_swap(FRM, USDT, UNISWAP_ROUTER),
    uniswap_like_swap(PRT, SFI, UNISWAP_ROUTER),
    uniswap_like_swap(UNI, USDC, UNISWAP_ROUTER),
    uniswap_like_swap(UNI, USDT, UNISWAP_ROUTER),
    uniswap_like_swap(UNI, DAI, UNISWAP_ROUTER),
    uniswap_like_swap(UNI, LINK, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, KEEP, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, LPT, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, ARCH, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, NFTX, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, WSTA, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, STA, UNISWAP_ROUTER),
    uniswap_like_swap(STA, WSTA, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, GUSD, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, RLY, UNISWAP_ROUTER),
    uniswap_like_swap(USDC, DSD, UNISWAP_ROUTER),
    # uniswap_like_swap(WETH, RUNE, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, ARMOR, UNISWAP_ROUTER),
    uniswap_like_swap(ARMOR, DAI, UNISWAP_ROUTER),
    uniswap_like_swap(ARMOR, WBTC, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, ARNXM, UNISWAP_ROUTER),
    uniswap_like_swap(UST, USDT, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, MIR, UNISWAP_ROUTER),
    uniswap_like_swap(MIR, UST, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, LON, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, ALPHA, UNISWAP_ROUTER),
    uniswap_like_swap(ALPHA, IBETH, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, IBETH, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, SHAKE, UNISWAP_ROUTER),
    uniswap_like_swap(SHAKE, MILK2, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, MILK2, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, PERP, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, SETH, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, SHROOM, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, ADX, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, TEL, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, FTM, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, RGT, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, SASHIMI, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, TORN, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, DNT, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, OPIUM, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, STETH, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, LDO, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, STAKEDETH, UNISWAP_ROUTER),
    uniswap_like_swap(STAKEDETH, USDC, UNISWAP_ROUTER),
    uniswap_like_swap(STAKEDETH, COMP, UNISWAP_ROUTER),
    uniswap_like_swap(AOX, USDC, UNISWAP_ROUTER),
    uniswap_like_swap(WETH, AOX, UNISWAP_ROUTER),

    uniswap_like_swap(WETH, USDC, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, DAI, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, WBTC, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, AAVE, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, LEND, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, YFI, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, SNX, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, COMP, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, WNXM, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, MKR, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, UNI, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, LINK, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, UMA, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, SRM, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, BAND, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, COVER, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, CRV, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, REN, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, AKRO, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, RENBTC, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, HEGIC, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, YAM, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, CRD, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, SEEN, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, USDT, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, LINA, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, SUSD, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, SUSHI, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, ICHI, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, ESD, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, SFI, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, KP3R, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, DOUGH, SUSHISWAP_ROUTER),
    uniswap_like_swap(WBTC, BADGER, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, CVP, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, PICKLE, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, DPI, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, ARCH, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, PNK, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, YETI, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, CREAM, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, JRT, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, DSD, SUSHISWAP_ROUTER),
    uniswap_like_swap(USDC, DSD, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, FTT, SUSHISWAP_ROUTER),
    # uniswap_like_swap(WETH, RUNE, SUSHISWAP_ROUTER),
    # uniswap_like_swap(RUNE, YFI, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, ARMOR, SUSHISWAP_ROUTER),
    uniswap_like_swap(ARMOR, DAI, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, ARNXM, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, NFTX, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, INDEX, SUSHISWAP_ROUTER),
    uniswap_like_swap(LON, USDT, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, DEFIL, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, UST, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, YUSD, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, ALPHA, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, FTM, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, RGT, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, TORN, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, DNT, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, LDO, SUSHISWAP_ROUTER),
    uniswap_like_swap(WETH, OPIUM, SUSHISWAP_ROUTER),
    uniswap_like_swap(LDO, KP3R, SUSHISWAP_ROUTER),

    uniswap_like_swap(WETH, WBTC, CRO_ROUTER),
    uniswap_like_swap(WETH, CRO, CRO_ROUTER),
    uniswap_like_swap(WETH, USDT, CRO_ROUTER),
    uniswap_like_swap(WETH, USDC, CRO_ROUTER),
    uniswap_like_swap(WETH, LINK, CRO_ROUTER),
    uniswap_like_swap(WETH, DAI, CRO_ROUTER),
    uniswap_like_swap(WETH, COMP, CRO_ROUTER),
    uniswap_like_swap(CRO, USDT, CRO_ROUTER),
    uniswap_like_swap(CRO, USDC, CRO_ROUTER),
    uniswap_like_swap(WETH, YFI, CRO_ROUTER),
    uniswap_like_swap(WETH, UNI, CRO_ROUTER),
    uniswap_like_swap(CRO, DAI, CRO_ROUTER),
    uniswap_like_swap(WETH, TRU, CRO_ROUTER),
    uniswap_like_swap(YFI, WBTC, CRO_ROUTER),
    uniswap_like_swap(WETH, AAVE, CRO_ROUTER),
    uniswap_like_swap(LINK, WBTC, CRO_ROUTER),
    uniswap_like_swap(WETH, CRV, CRO_ROUTER),
    uniswap_like_swap(WETH, REN, CRO_ROUTER),
    uniswap_like_swap(CRO, LINK, CRO_ROUTER),

    # uniswap_like_swap(WETH, LINK, LINKSWAP_ROUTER),
    # uniswap_like_swap(LINK, DPI, LINKSWAP_ROUTER),
    # uniswap_like_swap(WETH, YFL, LINKSWAP_ROUTER),
    # uniswap_like_swap(LINK, USDT, LINKSWAP_ROUTER),
    # uniswap_like_swap(WETH, USDC, LINKSWAP_ROUTER),
    # uniswap_like_swap(LINK, YAX, LINKSWAP_ROUTER),
    # uniswap_like_swap(LINK, CEL, LINKSWAP_ROUTER),
    # uniswap_like_swap(WETH, USDT, LINKSWAP_ROUTER),
    # uniswap_like_swap(LINK, GSWAP, LINKSWAP_ROUTER),

    uniswap_like_swap(WETH, LINK, SAKESWAP_ROUTER),
    uniswap_like_swap(WETH, SAKE, SAKESWAP_ROUTER),
    uniswap_like_swap(SAKE, USDC, SAKESWAP_ROUTER),
    uniswap_like_swap(WETH, COMP, SAKESWAP_ROUTER),
    uniswap_like_swap(SAKE, USDT, SAKESWAP_ROUTER),

    uniswap_like_swap(WETH, SASHIMI, SASHIMISWAP_ROUTER),
    uniswap_like_swap(WETH, UNI, SASHIMISWAP_ROUTER),
    uniswap_like_swap(WETH, YFI, SASHIMISWAP_ROUTER),
    uniswap_like_swap(WETH, WBTC, SASHIMISWAP_ROUTER),
    uniswap_like_swap(WETH, USDT, SASHIMISWAP_ROUTER),
    uniswap_like_swap(WETH, USDC, SASHIMISWAP_ROUTER),
`

let currentTkns = `
    USDT = get_token("0xdAC17F958D2ee523a2206206994597C13D831ec7", "USDT")
    MUSDT = get_token("0x84d4AfE150dA7Ea1165B9e45Ff8Ee4798d7C38DA", "MUSDT")
    LINK = get_token("0x514910771AF9Ca656af840dff83E8264EcF986CA", "LINK")
    SRM = get_token("0x476c5E26a75bd202a9683ffD34359C0CC15be0fF", "SRM")
    CREAM = get_token("0x2ba592F78dB6436527729929AAf6c908497cB200", "CREAM")
    DPI = get_token("0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b", "DPI")
    AMPL = get_token("0xD46bA6D942050d489DBd938a2C909A5d5039A161", "AMPL")
    MKR = get_token("0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2", "MKR")
    UNI = get_token("0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", "UNI")
    YFI = get_token("0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e", "YFI")
    WNXM = get_token("0x0d438F3b5175Bebc262bF23753C1E53d03432bDE", "WNXM")
    SNX = get_token("0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F", "SNX")
    REN = get_token("0x408e41876cccdc0f92210600ef50372656052a38", "REN")
    COMP = get_token("0xc00e94cb662c3520282e6f5717214004a7f26888", "COMP")
    CRV = get_token("0xD533a949740bb3306d119CC777fa900bA034cd52", "CRV")
    WBTC = get_token("0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", "WBTC")
    YFV = get_token("0x49E833337ECe7aFE375e44F4E3e8481029218E5c", "YFV")
    STRONG = get_token("0x990f341946A3fdB507aE7e52d17851B87168017c", "STRONG")
    AAVE = get_token("0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", "AAVE")
    ULST = get_token("0xDCd13da7D48820C2BdB866e31Fe085b56CcbCaF2", "ULST")
    KP3R = get_token("0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44", "KP3R")
    REPV2 = get_token("0x221657776846890989a759BA2973e427DfF5C9bB", "REPV2")
    ENJ = get_token("0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c", "ENJ")
    ZRX = get_token("0xE41d2489571d322189246DaFA5ebDe1F4699F498", "ZRX")
    BAT = get_token("0x0D8775F648430679A709E98d2b0Cb6250d2887EF", "BAT")
    KNC = get_token("0xdd974D5C2e2928deA5F71b9825b8b646686BD200", "KNC")
    ANT = get_token("0xa117000000f279D81A1D3cc75430fAA017FA5A2e", "ANT")
    USDC = get_token("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", "USDC")
    DAI = get_token("0x6B175474E89094C44Da98b954EedeAC495271d0F", "DAI")
    HEGIC = get_token("0x584bC13c7D411c00c01A62e8019472dE68768430", "HEGIC")
    CVP = get_token("0x38e4adB44ef08F22F5B5b76A8f0c2d0dCbE7DcA1", "CVP")
    LEND = get_token("0x80fB784B7eD66730e8b1DBd9820aFD29931aab03", "LEND")
    AKRO = get_token("0x8Ab7404063Ec4DBcfd4598215992DC3F8EC853d7", "AKRO")
    ADEL = get_token("0x94d863173EE77439E4292284fF13fAD54b3BA182", "ADEL")
    STAKE = get_token("0x0Ae055097C6d159879521C384F1D2123D1f195e6", "STAKE")
    GUSD = get_token("0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd", "GUSD")
    UMA = get_token("0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828", "UMA")
    BAL = get_token("0xba100000625a3754423978a60c9317c58a424e3D", "BAL")
    VOX = get_token("0x12D102F06da35cC0111EB58017fd2Cd28537d0e1", "VOX")
    VALUE = get_token("0x49E833337ECe7aFE375e44F4E3e8481029218E5c", "VALUE")
    SNTVT = get_token("0x7865af71cf0b288b4E7F654f4F7851EB46a2B7F8", "SNTVT")
    APY = get_token("0x95a4492F028aa1fd432Ea71146b433E7B4446611", "APY")
    OCTO = get_token("0x7240aC91f01233BaAf8b064248E80feaA5912BA3", "OCTO")
    GNO = get_token("0x6810e776880C02933D47DB1b9fc05908e5386b96", "GNO")
    BAND = get_token("0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55", "BAND")
    XOR = get_token("0x40FD72257597aA14C7231A7B1aaa29Fce868F677", "XOR")
    OLD_COVER = get_token("0x5D8d9F5b96f4438195BE9b99eee6118Ed4304286", "OLD_COVER")
    RENBTC = get_token("0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D", "RENBTC")
    YAM = get_token("0x0AaCfbeC6a24756c20D41914F2caba817C0d8521", "YAM")
    YUSD = get_token("0x5dbcF33D8c2E976c6b560249878e6F1491Bca25c", "YUSD")
    ADX = get_token("0xADE00C28244d5CE17D72E40330B1c318cD12B7c3", "ADX")
    DMG = get_token("0xEd91879919B71bB6905f23af0A68d231EcF87b14", "DMG")
    TRND = get_token("0xc3dD23A0a854b4f9aE80670f528094E9Eb607CCb", "TRND")
    KIT = get_token("0x7866E48C74CbFB8183cd1a929cd9b95a7a5CB4F4", "KIT")
    LRC = get_token("0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD", "LRC")
    FET = get_token("0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85", "FET")
    TRU = get_token("0x4C19596f5aAfF459fA38B0f7eD92F11AE6543784", "TRU")
    CRO = get_token("0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b", "CRO")
    YFL = get_token("0x28cb7e841ee97947a86B06fA4090C8451f64c0be", "YFL")
    OXT = get_token("0x4575f41308EC1483f3d399aa9a2826d74Da13Deb", "OXT")
    INDEX = get_token("0x0954906da0Bf32d5479e25f46056d22f08464cab", "INDEX")
    VERA = get_token("0xdF1D6405df92d981a2fB3ce68F6A03baC6C0E41F", "VERA")
    MARK = get_token("0x67c597624B17b16fb77959217360B7cD18284253", "MARK")
    SYN = get_token("0x1695936d6a953df699C38CA21c2140d497C08BD9", "SYN")
    ZHEGIC = get_token("0x837010619aeb2AE24141605aFC8f66577f6fb2e7", "ZHEGIC")
    RARI = get_token("0xFca59Cd816aB1eaD66534D82bc21E7515cE441CF", "RARI")
    NMR = get_token("0x1776e1F26f98b1A5dF9cD347953a26dd3Cb46671", "NMR")
    CRD = get_token("0xcAaa93712BDAc37f736C323C93D4D5fDEFCc31CC", "CRD")
    JRT = get_token("0x8A9C67fee641579dEbA04928c4BC45F66e26343A", "JRT")
    QNT = get_token("0x4a220E6096B25EADb88358cb44068A3248254675", "QNT")
    DFD = get_token("0x20c36f062a31865bED8a5B1e512D9a1A20AA333A", "DFD")
    DUSD = get_token("0x5BC25f649fc4e26069dDF4cF4010F9f706c23831", "DUSD")
    MTA = get_token("0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2", "MTA")
    MUSD = get_token("0xe2f2a5C287993345a840Db3B0845fbC70f5935a5", "MUSD")
    DOUGH = get_token("0xad32A8e6220741182940c5aBF610bDE99E737b2D", "DOUGH")
    HAKKA = get_token("0x0E29e5AbbB5FD88e28b2d355774e73BD47dE3bcd", "HAKKA")
    SEEN = get_token("0xCa3FE04C7Ee111F0bbb02C328c699226aCf9Fd33", "SEEN")
    COL = get_token("0xC76FB75950536d98FA62ea968E1D6B45ffea2A55", "COL")
    BADGER = get_token("0x3472A5A71965499acd81997a54BBA8D852C6E53d", "BADGER")
    MPH = get_token("0x8888801aF4d980682e47f1A9036e589479e835C5", "MPH")
    PICKLE = get_token("0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5", "PICKLE")
    LINA = get_token("0x3E9BC21C9b189C09dF3eF1B824798658d5011937", "LINA")
    ARTE = get_token("0x34612903Db071e888a4dADcaA416d3EE263a87b9", "ARTE")
    UBXT = get_token("0x8564653879a18C560E7C0Ea0E084c516C62F5653", "UBXT")
    YAX = get_token("0xb1dC9124c395c1e97773ab855d66E879f053A289", "YAX")
    CEL = get_token("0xaaAEBE6Fe48E54f431b0C390CfaF0b017d09D42d", "CEL")
    GSWAP = get_token("0xaac41EC512808d64625576EDdd580e7Ea40ef8B2", "GSWAP")
    ZUT = get_token("0x83f873388cd14b83a9f47fabde3c9850b5c74548", "ZUT")
    DRC = get_token("0xb78B3320493a4EFaa1028130C5Ba26f0B6085Ef8", "DRC")
    UNIFI = get_token("0x9E78b8274e1D6a76a0dBbf90418894DF27cBCEb5", "UNIFI")
    BUIDL = get_token("0x7b123f53421b1bF8533339BFBdc7C98aA94163db", "BUIDL")
    XBTC = get_token("0xECbF566944250ddE88322581024E611419715f7A", "XBTC")
    STORJ = get_token("0xB64ef51C888972c908CFacf59B47C1AfBC0Ab8aC", "STORJ")
    SUSD = get_token("0x57Ab1ec28D129707052df4dF418D58a2D46d5f51", "SUSD")
    MIXS = get_token("0xB0BFB1E2F72511cF8b4D004852E2054d7b9a76e1", "MIXS")
    BNI = get_token("0x4981553e8CcF6Df916B36a2d6B6f8fC567628a51", "BNI")
    USD = get_token("0x2F6081E3552b1c86cE4479B80062A1ddA8EF23E3", "USD")
    VAL = get_token("0xe88f8313e61A97cEc1871EE37fBbe2a8bf3ed1E4", "VAL")
    DG = get_token("0xEE06A81a695750E71a662B51066F2c74CF4478a0", "DG")
    MANA = get_token("0x0F5D2fB29fb7d3CFeE444a200298f468908cC942", "MANA")
    OWL = get_token("0x1A5F9352Af8aF974bFC03399e3767DF6370d82e4", "OWL")
    SUSHI = get_token("0x6B3595068778DD592e39A122f4f5a5cF09C90fE2", "SUSHI")
    YETI = get_token("0xb4bebD34f6DaaFd808f73De0d10235a92Fbb6c3D", "YETI")
    KAI = get_token("0xd9ec3ff1f8be459bb9369b4e79e9ebcf7141c093", "KAI")
    GRT = get_token("0xc944E90C64B2c07662A292be6244BDf05Cda44a7", "GRT")
    ALBT = get_token("0x00a8b738E453fFd858a7edf03bcCfe20412f0Eb0", "ALBT")
    PIPT = get_token("0x26607aC599266b21d13c7aCF7942c7701a8b699c", "PIPT")
    ICHI = get_token("0x903bEF1736CDdf2A537176cf3C64579C3867A881", "ICHI")
    RPL = get_token("0xB4EFd85c19999D84251304bDA99E90B92300Bd93", "REPL")
    FRONT = get_token("0xf8C3527CC04340b208C854E985240c02F7B7793f", "FRONT")
    NIOX = get_token("0xc813EA5e3b48BEbeedb796ab42A30C5599b01740", "NIOX")
    DDIM = get_token("0xFbEEa1C75E4c4465CB2FCCc9c6d6afe984558E20", "DDIM")
    DUCK = get_token("0xC0bA369c8Db6eB3924965e5c4FD0b4C1B91e305F", "DUCK")
    AUC = get_token("0xc12d099be31567add4e4e4d0D45691C3F58f5663", "AUC")
    AETH = get_token("0xE95A203B1a91a908F9B9CE46459d101078c2c3cb", "AETH")
    UNCL = get_token("0x2f4eb47A1b1F4488C71fc10e39a4aa56AF33Dd49", "UNCL")
    UNCX = get_token("0xaDB2437e6F65682B85F814fBc12FeC0508A7B1D0", "UNCX")
    ORAI = get_token("0x4c11249814f11b9346808179Cf06e71ac328c1b5", "ORAI")
    SFI = get_token("0xb753428af26E81097e7fD17f40c88aaA3E04902c", "SFI")
    GEEQ = get_token("0x6B9f031D718dDed0d681c20cB754F97b3BB81b78", "GEEQ")
    BTSE = get_token("0x666d875C600AA06AC1cf15641361dEC3b00432Ef", "BTSE")
    ESD = get_token("0x36F3FD68E7325a35EB768F1AedaAe9EA0689d723", "ESD")
    PNK = get_token("0x93ED3FBe21207Ec2E8f2d3c3de6e058Cb73Bc04d", "PNK")
    INCH = get_token("0x111111111117dc0aa78b770fa6a738034120c302", "1INCH")
    INJ = get_token("0xe28b3B32B6c345A34Ff64674606124Dd5Aceca30", "INJ")
    BCDT = get_token("0xAcfa209Fb73bF3Dd5bBfb1101B9Bc999C49062a5", "BCDT")
    FXS = get_token("0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0", "FXS")
    FRAX = get_token("0x853d955aCEf822Db058eb8505911ED77F175b99e", "FRAX")
    PTF = get_token("0xC57d533c50bC22247d49a368880fb49a1caA39F7", "PTF")
    DSLA = get_token("0x3affcca64c2a6f4e3b6bd9c64cd2c969efd1ecbe", "DSLA")
    FRM = get_token("0xE5CAeF4Af8780E59Df925470b050Fb23C43CA68C", "FRM")
    FRMX = get_token("0xf6832EA221ebFDc2363729721A146E6745354b14", "FRXM")
    MMX = get_token("0x8a6f3BF52A26a21531514E23016eEAe8Ba7e7018", "MMX")
    BSDS = get_token("0xE7C9C188138f7D70945D420d75F8Ca7d8ab9c700", "BSDS")
    BSD = get_token("0x003e0af2916e598Fa5eA5Cb2Da4EDfdA9aEd9Fde", "BSD")
    REVV = get_token("0x557B933a7C2c45672B610F8954A3deB39a51A8Ca", "REVV")
    LCX = get_token("0x037A54AaB062628C9Bbae1FDB1583c195585fe41", "LCX")
    LYM = get_token("0xc690F7C7FcfFA6a82b79faB7508c466FEfdfc8c5", "LYM")
    DYP = get_token("0x961C8c0B1aaD0c0b10a51FeF6a867E3091BCef17", "DYP")
    PERP = get_token("0xbC396689893D065F41bc2C6EcbeE5e0085233447", "PERP")
    SHROOM = get_token("0xEd0439EACf4c4965AE4613D77a5C2Efe10e5f183", "SHRROM")
    PRT = get_token("0x6D0F5149c502faf215C89ab306ec3E50b15e2892", "PRT")
    AGA = get_token("0x2D80f5F5328FdcB6ECeb7Cacf5DD8AEDaEC94e20", "AGA")
    AGAR = get_token("0xb453f1f2EE776dAF2586501361c457dB70e1ca0F", "AGAR")
    KEEP = get_token("0x85Eee30c52B0b379b046Fb0F85F4f3Dc3009aFEC", "KEEP")
    TBTC = get_token("0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa", "TBTC")
    AST = get_token("0x27054b13b1B798B345b591a4d22e6562d47eA75a", "AST")
    DXD = get_token("0xa1d65E8fB6e87b60FECCBc582F7f97804B725521", "DXD")
    NEC = get_token("0xcc80c051057b774cd75067dc48f8987c4eb97a5e", "NEC")
    RLC = get_token("0x607F4C5BB672230e8672085532f7e901544a7375", "RLC")
    MCX = get_token("0xd15eCDCF5Ea68e3995b2D0527A0aE0a3258302F8", "MCX")
    LPT = get_token("0x58b6A8A3302369DAEc383334672404Ee733aB239", "LPT")
    AXS = get_token("0xF5D669627376EBd411E34b98F19C868c8ABA5ADA", "AXS")
    BFIE = get_token("0x81859801b01764D4f0Fa5E64729f5a6C3b91435b", "BFIE")
    UWL = get_token("0xdbDD6F355A37b94e6C7D32fef548e98A280B8Df5", "UWL")
    ARCH = get_token("0x1F3f9D3068568F8040775be2e8C03C103C61f3aF", "ARCH")
    NFTX = get_token("0x87d73E916D7057945c9BcD8cdd94e42A6F47f776", "NFTX")
    COVER = get_token("0x4688a8b1F292FDaB17E9a90c8Bc379dC1DBd8713", "COVER")
    RSR = get_token("0x8762db106B2c2A0bccB3A80d1Ed41273552616E8", "RSR")
    ORN = get_token("0x0258F474786DdFd37ABCE6df6BBb1Dd5dfC4434a", "ORN")
    WSTA = get_token("0xeDEec5691f23E4914cF0183A4196bBEb30d027a0", "WSTA")
    STA = get_token("0xa7DE087329BFcda5639247F96140f9DAbe3DeED1", "STA")
    L2 = get_token("0xBbff34E47E559ef680067a6B1c980639EEb64D24", "L2")
    FX = get_token("0x8c15Ef5b4B21951d50E53E4fbdA8298FFAD25057", "FX")
    NPXS = get_token("0xA15C7Ebe1f07CaF6bFF097D8a589fb8AC49Ae5B3", "NPXS")
    HEX = get_token("0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39", "HEX")
    RLY = get_token("0xf1f955016EcbCd7321c7266BccFB96c68ea5E49b", "RLY")
    UFT = get_token("0x0202Be363B8a4820f3F4DE7FaF5224fF05943AB1", "UFT")
    IDLE = get_token("0x875773784Af8135eA0ef43b5a374AaD105c5D39e", "IDLE")
    DSD = get_token("0xbd2f0cd039e0bfcf88901c98c0bfac5ab27566e3", "DSD")
    FTT = get_token("0x50D1c9771902476076eCFc8B2A83Ad6b9355a4c9", "FTT")
    RUNE = get_token("0x3155BA85D5F96b2d030a4966AF206230e46849cb", "RUNE")
    ARMOR = get_token("0x1337DEF16F9B486fAEd0293eb623Dc8395dFE46a", "ARMOR")
    ARNXM = get_token("0x1337def18c680af1f9f45cbcab6309562975b1dd", "ARNXM")
    UST = get_token("0xa47c8bf37f92aBed4A126BDA807A7b7498661acD", "UST")
    MIR = get_token("0x09a3EcAFa817268f77BE1283176B946C4ff2E608", "MIR")
    LON = get_token("0x0000000000095413afC295d19EDeb1Ad7B71c952", "LON")
    DEFIL = get_token("0x78F225869c08d478c34e5f645d07A87d3fe8eb78", "DEFIL")
    ALPHA = get_token("0xa1faa113cbE53436Df28FF0aEe54275c13B40975", "ALPHA")
    IBETH = get_token("0x67B66C99D3Eb37Fa76Aa3Ed1ff33E8e39F0b9c7A", "IBETH")
    BCP = get_token("0xe4f726adc8e89c6a6017f01eada77865db22da14", "BCP")
    DEFIS = get_token("0xaD6A626aE2B43DCb1B39430Ce496d2FA0365BA9C", "DEFIS")
    DEFIPP = get_token("0x8D1ce361eb68e9E05573443C407D4A3Bed23B033", "DEFIPP")
    SAKE = get_token("0x066798d9ef0833ccc719076Dab77199eCbd178b0", "SAKE")
    SHAKE = get_token("0x6006fc2a849fedaba8330ce36f5133de01f96189", "SHAKE")
    MILK2 = get_token("0x80c8c3dcfb854f9542567c8dac3f44d709ebc1de", "MILK2")
    SETH = get_token("0x5e74C9036fb86BD7eCdcb084a0673EFc32eA31cb", "SETH")
    TEL = get_token("0x467Bccd9d29f223BcE8043b84E8C8B282827790F", "TEL")
    FTM = get_token("0x4E15361FD6b4BB609Fa63C81A2be19d873717870", "FTM")
    RGT = get_token("0xD291E7a03283640FDc51b121aC401383A46cC623", "RGT")
    SASHIMI = get_token("0xC28E27870558cF22ADD83540d2126da2e4b464c2", "SASHIMI")
    TORN = get_token("0x77777FeDdddFfC19Ff86DB637967013e6C6A116C", "TORN")
    DNT = get_token("0x0AbdAce70D3790235af448C88547603b945604ea", "DNT")
    OPIUM = get_token("0x888888888889c00c67689029d7856aac1065ec11", "OPIUM")
    STETH = get_token("0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", "STETH")
    LDO = get_token("0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", "LDO")
    STAKEDETH = get_token("0xDFe66B14D37C77F4E9b180cEb433d1b164f0281D", "STAKEDETH")
    AOX = get_token("0x466060dD07ea7914E1e8d22B9cd0E2f308C18045", "AOX")
    currentTkns
`

console.log('New pairs')
pools.forEach(pool => {
    let exchange = pool.exchange!='crypto' ? pool.exchange : 'CRO'
    let router = exchange.toUpperCase() + '_ROUTER'
    let tkn1 = tknIdMap[pool.tkns[1].id].symbol.toUpperCase()
    let tkn2 = tknIdMap[pool.tkns[0].id].symbol.toUpperCase()
    let line1 = `uniswap_like_swap(${tkn1}, ${tkn2}, ${router}),`
    let line2 = `uniswap_like_swap(${tkn2}, ${tkn1}, ${router}),`
    if (!currentPairs.includes(line1) && !currentPairs.includes(line2)) {
        console.log(line1)
    }
})

console.log('New tokens')
tokens.forEach(tkn => {
    let line = `${tkn.symbol.toUpperCase()} = get_token("${tkn.address}", "${tkn.symbol.toUpperCase()}")`
    if (!currentTkns.includes(line)) {
        console.log(line)
    }
})