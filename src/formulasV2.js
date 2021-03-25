_R_STATUS_
_BASE_BALANCE_
_QUOTE_BALANCE_
_LP_FEE_RATE_
_MT_FEE_RATE_
_K_

function getExpectedTarget() {

}

// ============ R = 1 cases ============

function _ROneSellBaseToken(amount, targetQuoteTokenAmount) {
        let i = getOraclePrice();
        let Q2 = DODOMath._SolveQuadraticFunctionForTrade(
            targetQuoteTokenAmount,
            targetQuoteTokenAmount,
            DecimalMath.mul(i, amount),
            false,
            _K_
        )
        // in theory Q2 <= targetQuoteTokenAmount
        // however when amount is close to 0, precision problems may cause Q2 > targetQuoteTokenAmount
        return targetQuoteTokenAmount.sub(Q2);
    }

function _ROneBuyBaseToken(amount, targetBaseTokenAmount) {
        let B2 = targetBaseTokenAmount.sub(amount);
        payQuoteToken = _RAboveIntegrate(targetBaseTokenAmount, targetBaseTokenAmount, B2);
        return payQuoteToken;
}

// ============ R < 1 cases ============

function _RBelowSellBaseToken(
    uint256 amount,
    uint256 quoteBalance,
    uint256 targetQuoteAmount
) internal view returns (uint256 receieQuoteToken) {
    uint256 i = getOraclePrice();
    uint256 Q2 = DODOMath._SolveQuadraticFunctionForTrade(
        targetQuoteAmount,
        quoteBalance,
        DecimalMath.mul(i, amount),
        false,
        _K_
    );
    return quoteBalance.sub(Q2);
}

function _RBelowBuyBaseToken(
    uint256 amount,
    uint256 quoteBalance,
    uint256 targetQuoteAmount
) internal view returns (uint256 payQuoteToken) {
    // Here we don't require amount less than some value
    // Because it is limited at upper function
    // See Trader.queryBuyBaseToken
    uint256 i = getOraclePrice();
    uint256 Q2 = DODOMath._SolveQuadraticFunctionForTrade(
        targetQuoteAmount,
        quoteBalance,
        DecimalMath.mulCeil(i, amount),
        true,
        _K_
    );
    return Q2.sub(quoteBalance);
}

function _querySellBaseToken(amount) {
        (newBaseTarget, newQuoteTarget) = getExpectedTarget();

        let sellBaseAmount = amount;

        if (_R_STATUS_ == 'ONE') {
            // case 1: R=1
            // R falls below one
            receiveQuote = _ROneSellBaseToken(sellBaseAmount, newQuoteTarget);
            newRStatus = 'BELOW_ONE';
        } else if (_R_STATUS_ == 'ABOVE_ONE') {
            let backToOnePayBase = newBaseTarget.sub(_BASE_BALANCE_);
            let backToOneReceiveQuote = _QUOTE_BALANCE_.sub(newQuoteTarget);
            // case 2: R>1
            // complex case, R status depends on trading amount
            if (sellBaseAmount < backToOnePayBase) {
                // case 2.1: R status do not change
                receiveQuote = _RAboveSellBaseToken(sellBaseAmount, _BASE_BALANCE_, newBaseTarget);
                newRStatus = 'ABOVE_ONE'
                if (receiveQuote > backToOneReceiveQuote) {
                    // [Important corner case!] may enter this branch when some precision problem happens. And consequently contribute to negative spare quote amount
                    // to make sure spare quote>=0, mannually set receiveQuote=backToOneReceiveQuote
                    receiveQuote = backToOneReceiveQuote;
                }
            } else if (sellBaseAmount == backToOnePayBase) {
                // case 2.2: R status changes to ONE
                receiveQuote = backToOneReceiveQuote;
                newRStatus = 'ONE';
            } else {
                // case 2.3: R status changes to BELOW_ONE
                receiveQuote = backToOneReceiveQuote.add(
                    _ROneSellBaseToken(sellBaseAmount.sub(backToOnePayBase), newQuoteTarget)
                );
                newRStatus = Types.RStatus.BELOW_ONE;
            }
        } else {
            // _R_STATUS_ == Types.RStatus.BELOW_ONE
            // case 3: R<1
            receiveQuote = _RBelowSellBaseToken(sellBaseAmount, _QUOTE_BALANCE_, newQuoteTarget);
            newRStatus = 'BELOW_ONE';
        }

        // count fees
        lpFeeQuote = DecimalMath.mul(receiveQuote, _LP_FEE_RATE_);
        mtFeeQuote = DecimalMath.mul(receiveQuote, _MT_FEE_RATE_);
        receiveQuote = receiveQuote.sub(lpFeeQuote).sub(mtFeeQuote);

        return (receiveQuote, lpFeeQuote, mtFeeQuote, newRStatus, newQuoteTarget, newBaseTarget);
}

function _queryBuyQueryToken(amount) {
    (newQuoteTarget, newBaseTarget) = getExpectedTarget();

    let sellQuoteAmount = amount;

    if (_R_STATUS_ == 'ONE') {
        // case 1: R=1
        // R falls below one
        receiveQuote = _ROneSellBaseToken(sellBaseAmount, newQuoteTarget);
        newRStatus = 'BELOW_ONE';
    } else if (_R_STATUS_ == 'ABOVE_ONE') {
        let backToOnePayBase = newBaseTarget.sub(_BASE_BALANCE_);
        let backToOneReceiveQuote = _QUOTE_BALANCE_.sub(newQuoteTarget);
        // case 2: R>1
        // complex case, R status depends on trading amount
        if (sellBaseAmount < backToOnePayBase) {
            // case 2.1: R status do not change
            receiveQuote = _RAboveSellBaseToken(sellBaseAmount, _BASE_BALANCE_, newBaseTarget);
            newRStatus = 'ABOVE_ONE'
            if (receiveQuote > backToOneReceiveQuote) {
                // [Important corner case!] may enter this branch when some precision problem happens. And consequently contribute to negative spare quote amount
                // to make sure spare quote>=0, mannually set receiveQuote=backToOneReceiveQuote
                receiveQuote = backToOneReceiveQuote;
            }
        } else if (sellBaseAmount == backToOnePayBase) {
            // case 2.2: R status changes to ONE
            receiveQuote = backToOneReceiveQuote;
            newRStatus = 'ONE';
        } else {
            // case 2.3: R status changes to BELOW_ONE
            receiveQuote = backToOneReceiveQuote.add(
                _ROneSellBaseToken(sellBaseAmount.sub(backToOnePayBase), newQuoteTarget)
            );
            newRStatus = Types.RStatus.BELOW_ONE;
        }
    } else {
        // _R_STATUS_ == Types.RStatus.BELOW_ONE
        // case 3: R<1
        receiveQuote = _RBelowSellBaseToken(sellBaseAmount, _QUOTE_BALANCE_, newQuoteTarget);
        newRStatus = 'BELOW_ONE';
    }

    // count fees
    lpFeeQuote = DecimalMath.mul(receiveQuote, _LP_FEE_RATE_);
    mtFeeQuote = DecimalMath.mul(receiveQuote, _MT_FEE_RATE_);
    receiveQuote = receiveQuote.sub(lpFeeQuote).sub(mtFeeQuote);

    return (receiveQuote, lpFeeQuote, mtFeeQuote, newRStatus, newQuoteTarget, newBaseTarget);
}

function _queryBuyBaseToken(amount) {
        (newBaseTarget, newQuoteTarget) = getExpectedTarget();

        // charge fee from user receive amount
        lpFeeBase = DecimalMath.mul(amount, _LP_FEE_RATE_);
        mtFeeBase = DecimalMath.mul(amount, _MT_FEE_RATE_);
        let buyBaseAmount = amount.add(lpFeeBase).add(mtFeeBase);

        if (_R_STATUS_ == 'ONE') {
            // case 1: R=1
            payQuote = _ROneBuyBaseToken(buyBaseAmount, newBaseTarget);
            newRStatus = 'ABOVE_ONE';
        } else if (_R_STATUS_ == 'ABOVE_ONE') {
            // case 2: R>1
            payQuote = _RAboveBuyBaseToken(buyBaseAmount, _BASE_BALANCE_, newBaseTarget);
            newRStatus = 'ABOVE_ONE';
        } else if (_R_STATUS_ == 'BELOW_ONE') {
            let backToOnePayQuote = newQuoteTarget.sub(_QUOTE_BALANCE_);
            let backToOneReceiveBase = _BASE_BALANCE_.sub(newBaseTarget);
            // case 3: R<1
            // complex case, R status may change
            if (buyBaseAmount < backToOneReceiveBase) {
                // case 3.1: R status do not change
                // no need to check payQuote because spare base token must be greater than zero
                payQuote = _RBelowBuyBaseToken(buyBaseAmount, _QUOTE_BALANCE_, newQuoteTarget);
                newRStatus = 'BELOW_ONE';
            } else if (buyBaseAmount == backToOneReceiveBase) {
                // case 3.2: R status changes to ONE
                payQuote = backToOnePayQuote;
                newRStatus = 'ONE';
            } else {
                // case 3.3: R status changes to ABOVE_ONE
                payQuote = backToOnePayQuote.add(
                    _ROneBuyBaseToken(buyBaseAmount.sub(backToOneReceiveBase), newBaseTarget)
                );
                newRStatus = 'ABOVE_ONE';
            }
        }

        return (payQuote, lpFeeBase, mtFeeBase, newRStatus, newQuoteTarget, newBaseTarget);
}