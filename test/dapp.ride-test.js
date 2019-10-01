describe('otc test suite', async function () {
    
    // this.timeout(100000);
    
    let dec0AssetId, dec8AssetId, OTCuId;

    before(async function () {
        await setupAccounts({
            otc: 1000 * 10 ** 8,
            taker: 1000 * 10 ** 8,
            maker: 1000 * 10 ** 8
        });

        const issueOTCu = issue({ name: 'OTCu', description: '', quantity: 1000000 * 10 ** 8, decimals: 8 }, accounts.maker)
        OTCuId = issueOTCu.id;
        await broadcast(issueOTCu);

        const addAssets = data({
            data: [
                { key: 'assets', type: 'string', value: 'WAVES' + OTCuId },
            ]
        }, accounts.otc);
        await broadcast(addAssets);

        const script = file('dapp.ride').replace('9qh2MiJhfqNS1o3R5wcUrAAWpeqZs9R8SLwQvCx88Vaf', OTCuId)
        const compiled = compile(script);
        const ssTx = setScript({ script: compiled }, accounts.otc);
        await broadcast(ssTx);

        const issueDec0Tx = issue({ name: 'dec0', description: '', quantity: 1000000, decimals: 0 }, accounts.maker)
        dec0AssetId = issueDec0Tx.id;
        const issueDec8Tx = issue({ name: 'dec8', description: '', quantity: 1000000 * 10 ** 8, decimals: 8 }, accounts.maker)
        dec8AssetId = issueDec8Tx.id;
        await broadcast(issueDec0Tx);
        await broadcast(issueDec8Tx);

        await waitForTx(ssTx.id)
        console.log('Initialized')
    });
    
    it('Assets adding invalid price', async function () {
        const add0Dec = invokeScript({
            dApp: address(accounts.otc),
            call: {
                function: 'addAsset',
                args: [{type: 'string', value: dec0AssetId}],
            },
            payment: [{assetId: OTCuId, amount: 10 * 10 ** 8}]
        }, accounts.maker);
        
        expect(broadcast(add0Dec)).to.be.rejectedWith('You have to pay 100 OTCu or WAVES')
    })

    it('Cannot make order with non-whitelisted assets', async function () {
        const makeSell = invokeScript({
            dApp: address(accounts.otc),
            call: {
                function: 'makeSell',
                args: [
                    { type: 'string', value: dec8AssetId },
                    { type: 'integer', value: 1 },
                    { type: 'boolean', value: false },
                    { type: 'string', value: '' },
                ],
            },
            payment: [{ assetId: null, amount: 1 * 10 ** 8 }]
        }, accounts.maker);

        expect(broadcast(makeSell)).to.be.rejectedWith('Asset are not available for trading')
    })

    it.only('Assets adding', async function () {
        
        const add0Dec = invokeScript({
            dApp: address(accounts.otc),
            call: {
                function: 'addAsset',
                args: [{type: 'string', value: dec0AssetId}],
            },
            payment: [{assetId: OTCuId, amount: 100 * 10 ** 8}]
        }, accounts.maker);

        const add8Dec = invokeScript({
            dApp: address(accounts.otc),
            call: {
                function: 'addAsset',
                args: [{type: 'string', value: dec8AssetId}],
            },
            payment: [{assetId: null, amount: 100 * 10 ** 8}]
        }, accounts.maker);
        
        await broadcast(add0Dec)
        await broadcast(add8Dec)
        await waitForTx(add0Dec.id)
        await waitForTx(add8Dec.id)
    })

    it('Take sell order for dec8:WAVES', async function () {
        const makeSell = invokeScript({
            dApp: address(accounts.otc),
            call: {
                function: 'makeSell',
                args: [
                    { type: 'string', value: 'WAVES' },
                    { type: 'integer', value: '100000000' },
                    { type: 'boolean', value: false },
                    { type: 'string', value: '' },
                ],
            },
            payment: [{ assetId: dec8AssetId, amount: 100 * 10 ** 8 }]
        }, accounts.maker);

        await broadcast(makeSell)
        await waitForTx(makeSell.id)

        const takeSell = invokeScript({
            dApp: address(accounts.otc),
            call: {
                function: 'takeSell',
                args: [
                    { type: 'string', value: makeSell.id },
                    { type: 'string', value: '' },
                ],
            },
            payment: [{ assetId: null, amount: 10 ** 8 }]
        }, accounts.taker);

        await broadcast(takeSell)
    })

    it.only('Take sell order for dec0:WAVES', async function () {
        const makeSell = invokeScript({
            dApp: address(accounts.otc),
            call: {
                function: 'makeSell',
                args: [
                    { type: 'string', value: 'WAVES' },
                    { type: 'integer', value: '10000000000000000' },
                    { type: 'boolean', value: false },
                    { type: 'string', value: '' },
                ],
            },
            payment: [{ assetId: dec0AssetId, amount: 100 }]
        }, accounts.maker);

        await broadcast(makeSell)
        await waitForTx(makeSell.id)

        const takeSell = invokeScript({
            dApp: address(accounts.otc),
            call: {
                function: 'takeSell',
                args: [
                    { type: 'string', value: makeSell.id },
                    { type: 'string', value: '' },
                ],
            },
            payment: [{ assetId: null, amount: 1 * 10 ** 8 }]
        }, accounts.taker);

        await broadcast(takeSell)
    })

    it('Take sell order for WAVES:dec0', async function () {
        const makeSell = invokeScript({
            dApp: address(accounts.otc),
            call: {
                function: 'makeSell',
                args: [
                    { type: 'string', value: dec0AssetId },
                    { type: 'integer', value: '1' },
                    { type: 'boolean', value: false },
                    { type: 'string', value: '' },
                ],
            },
            payment: [{ assetId: null, amount: 100 * 10 ** 8 }]
        }, accounts.taker);

        await broadcast(makeSell)
        await waitForTx(makeSell.id)

        const takeSell = invokeScript({
            dApp: address(accounts.otc),
            call: {
                function: 'takeSell',
                args: [
                    { type: 'string', value: makeSell.id },
                    { type: 'string', value: '' },
                ],
            },
            payment: [{ assetId: dec0AssetId, amount: 1 }]
        }, accounts.maker);

        await broadcast(takeSell)
    })

    it('Take buy order for dec0/WAVES', async function () {
        const makeBuy = invokeScript({
            dApp: address(accounts.otc),
            call: {
                function: 'makeBuy',
                args: [
                    { type: 'string', value: dec0AssetId },
                    { type: 'integer', value: '10000000000000000' },
                    { type: 'boolean', value: false },
                    { type: 'string', value: '' },
                ],
            },
            payment: [{ assetId: null, amount: 10 * 10 ** 8 }]
        }, accounts.taker);

        await broadcast(makeBuy)
        await waitForTx(makeBuy.id)

        const takeBuy = invokeScript({
            dApp: address(accounts.otc),
            call: {
                function: 'takeBuy',
                args: [
                    { type: 'string', value: makeBuy.id },
                    { type: 'string', value: '' },
                ],
            },
            payment: [{ assetId: dec0AssetId, amount: 1 }]
        }, accounts.maker);

        await broadcast(takeBuy)
    })

    it.only('Price asset decimals must be greater than or equal to amount asset decimals (WAVES/dec0)', async function () {
        const makeBuy = invokeScript({
            dApp: address(accounts.otc),
            call: {
                function: 'makeBuy',
                args: [
                    { type: 'string', value: 'WAVES' },
                    { type: 'integer', value: '1' },
                    { type: 'boolean', value: false },
                    { type: 'string', value: '' },
                ],
            },
            payment: [{ assetId: dec0AssetId, amount: 10 }]
        }, accounts.maker);

        expect(broadcast(makeBuy)).to.be.rejectedWith()
    })
    
    // it('Cannot withdraw more than was deposited', async function () {
    //     const iTxFoo = invokeScript({
    //         dApp: address(accounts.wallet),
    //         call: {
    //             function: "withdraw",
    //             args: [{type:'integer', value: 2 * wvs}]
    //         },
            
    //     }, accounts.foofoofoofoofoofoofoofoofoofoofoo);
        
    //     expect(broadcast(iTxFoo)).to.be.rejectedWith("Not enough balance")
    // })
})