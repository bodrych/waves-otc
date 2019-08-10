import axios from 'axios';
import config from './config';
import _ from 'lodash';
const nodeREST = config.nodeREST;

const mapKV = (list) => {
  const kv = {};
  _.forEach(list, item => kv[item.key] = item);
  return kv;
};

const getKeysByMask = async (address, mask) => {
  const data = await axios.get(`${nodeREST}/addresses/data/${address}?matches=${mask}`);
  return (data && data.data) ? mapKV(data.data) : null;
};

export default {
  fetchBalance: async (address) => {
    const balances = {};
    const data = await axios.get(`${nodeREST}/assets/balance/${address}`);
    _.forEach(data && data.data && data.data.balances,
      asset => balances[asset.assetId] = asset.balance / Math.pow(10, asset.issueTransaction.decimals));
    const waves = await axios.get(`${nodeREST}/addresses/balance/details/${address}`);
    if (waves && waves.data && waves.data.regular) {
      balances['WAVES'] = waves.data.regular / config.decimalsMul;
    }
    return balances;
  },
  makeVSTSellOrder: async ({ price, vstAmount }) => {
    const tx = {
      type: 16,
      data: {
        dApp: config.dApp,
        call: {
          function: 'makeSellVST',
          args: [
            { value: Math.round(price * config.decimalsMul), type: 'integer' },
          ],
        },
        fee: {
          assetId: 'WAVES',
          tokens: 0.005,
        },
        payment: [{
          tokens: vstAmount,
          assetId: config.assetId,
        }],
      },
    };
    return await window.WavesKeeper.signAndPublishTransaction(tx);
  },
  makeVSTBuyOrder: async ({ price, wavesAmount }) => {
    const tx = {
      type: 16,
      data: {
        dApp: config.dApp,
        call: {
          function: 'makeBuyVST',
          args: [
            { value: Math.round(price * config.decimalsMul), type: 'integer' },
          ],
        },
        fee: {
          assetId: 'WAVES',
          tokens: 0.005,
        },
        payment: [{
          tokens: wavesAmount,
          assetId: 'WAVES',
        }],
      },
    };
    return await window.WavesKeeper.signAndPublishTransaction(tx);
  },
  takeVSTSellOrder: async ({ orderId, wavesAmount }) => {
    const tx = {
      type: 16,
      data: {
        dApp: config.dApp,
        call: {
          function: 'takeSellVST',
          args: [
            { value: orderId, type: 'string' },
          ],
        },
        fee: {
          assetId: 'WAVES',
          tokens: 0.005,
        },
        payment: [{
          tokens: wavesAmount,
          assetId: 'WAVES',
        }],
      },
    };
    return await window.WavesKeeper.signAndPublishTransaction(tx);
  },
  takeVSTBuyOrder: async ({ orderId, vstAmount }) => {
    const tx = {
      type: 16,
      data: {
        dApp: config.dApp,
        call: {
          function: 'takeBuyVST',
          args: [
            { value: orderId, type: 'string' },
          ],
        },
        fee: {
          assetId: 'WAVES',
          tokens: 0.005,
        },
        payment: [{
          tokens: vstAmount,
          assetId: config.assetId,
        }],
      },
    };
    return await window.WavesKeeper.signAndPublishTransaction(tx);
  },
  cancelOrder: async ({ id, type }) => {
    const tx = {
      type: 16,
      data: {
        dApp: config.dApp,
        call: {
          function: `return${type === 'buy' ? 'Buy' : 'Sell'}VST`,
          args: [
            { value: id, type: 'string' },
          ],
        },
        fee: {
          assetId: 'WAVES',
          tokens: 0.005,
        },
        payment: [],
      },
    };
    return await window.WavesKeeper.signAndPublishTransaction(tx);
  },
  fetchOrders: async () => {
    const orders = {};
    const data = await getKeysByMask(config.dApp, '(buy|sell)_.*');
    _.forEach(data, item => {
      const parts = item.key.split('_');
      orders[parts[1]] = orders[parts[1]] || { type: parts[0], id: parts[1] };
      orders[parts[1]][parts[2]] = item.value;
    });
    return orders;
  },
  waitForKeeper: () => {
    return new Promise((resolve, reject) => {
      const started = Date.now();
      let checkerInterval = setInterval(() => {
        if (window.WavesKeeper && window.WavesKeeper.publicState) {
          clearInterval(checkerInterval);
          resolve();
        } else {
          if (Date.now() - started > 10000) {
            clearInterval(checkerInterval);
            reject();
          }
        }
      }, 50);
    });
  }
};
