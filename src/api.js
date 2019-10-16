import axios from 'axios';
import config from './config';
import _ from 'lodash';
import { nodeInteraction, waitForTx } from '@waves/waves-transactions';

// const mapKV = (list) => {
//   const kv = {};
//   _.forEach(list, item => kv[item.key] = item);
//   return kv;
// };

const fetchAccountData = async (address, matches, apiBase) => {
  const data = await axios.get(`${apiBase}addresses/data/${address}${matches ? '?matches=' + matches : ''}`)
  return data.data
}

export const fetchAddressStatus = async (address, apiBase) => {
  try {
    const unlimitedData = await nodeInteraction.accountDataByKey(address + '_unlimited', config.dApp, apiBase);
    const deadlineData = await nodeInteraction.accountDataByKey(address + '_time', config.dApp, apiBase);
    const unlimited = unlimitedData.value === true;
    const deadline = parseInt(deadlineData.value);
    return { unlimited, deadline }
  } catch(e) {
    return {}
  }
}

const fetchAssetDetails = async (assetId, apiBase) => {
  const data = await axios.get(`${apiBase}assets/details/${assetId}`)
  return data.data
}

const fetchAvailableAssets = async (apiBase) => {
  const data = await nodeInteraction.accountDataByKey('assets', config.dApp, apiBase);
  const assets = data.value.split(',');
  assets.splice(-1, 1);
  return assets;
}

export const fetchAvailableAssetsDetails = async (apiBase) => {
  const availableAssets = {};
  const assets = await fetchAvailableAssets(apiBase);
  const promises = assets.map(async item => {
    if (item !== 'WAVES') {
      const details = await fetchAssetDetails(item, apiBase);
      availableAssets[item] = { id: item, name: details.name, decimals: details.decimals };
    } else {
      availableAssets[item] = { id: item, name: item, decimals: 8 };
    }
  });
  await Promise.all(promises);
  return availableAssets;
}

export const fetchBalance = async (address, apiBase) => {
  const balances = {};
  const data = await axios.get(`${apiBase}assets/balance/${address}`);
  _.forEach(data && data.data && data.data.balances, asset => {
    balances[asset.assetId] = asset.balance;
  });
  const waves = await axios.get(`${apiBase}addresses/balance/details/${address}`);
  if (waves && waves.data && waves.data.regular) {
    balances['WAVES'] = waves.data.regular;
  }
  return balances;
}

export const fetchDAppBalance = async (apiBase) => {
  const reserveData = await nodeInteraction.accountDataByKey('reserve', config.dApp, apiBase);
  return reserveData.value;
}

export const fetchOrders = async (apiBase) => {
  try {
    const ordersData = await fetchAccountData(config.dApp, 'order_.*', apiBase)
    return ordersData;
  } catch (e) {
    throw e
  }
}

export const makeSell = async ({ amount, amountAsset, priceAssetAmount, priceAsset, all, password, wait, apiBase }) => {
  const tx = {
    type: 16,
    data: {
      dApp: config.dApp,
      call: {
        function: 'makeSell',
        args: [
          { value: priceAsset, type: 'string' },
          { value: priceAssetAmount, type: 'integer' },
          { value: all, type: 'boolean' },
          { value: password, type: 'string' },
        ],
      },
      fee: {
        assetId: 'WAVES',
        tokens: 0.005,
      },
      payment: [{
        coins: amount,
        assetId: amountAsset,
      }],
    },
  };
  try {
    const response = await window.WavesKeeper.signAndPublishTransaction(tx);
    if (wait) {
      const data = JSON.parse(response);
      await waitForTx(data.id, { apiBase });
    }
    return response;
  } catch (e) {
    throw e
  }
}

export const makeBuy = async ({ amount, amountAsset, priceAssetAmount, priceAsset, all, password, wait, apiBase }) => {
  const tx = {
    type: 16,
    data: {
      dApp: config.dApp,
      call: {
        function: 'makeBuy',
        args: [
          { value: amountAsset, type: 'string' },
          { value: amount, type: 'integer' },
          { value: all, type: 'boolean' },
          { value: password, type: 'string' },
        ],
      },
      fee: {
        assetId: 'WAVES',
        tokens: 0.005,
      },
      payment: [{
        coins: priceAssetAmount,
        assetId: priceAsset,
      }],
    },
  };
  try {
    const response = await window.WavesKeeper.signAndPublishTransaction(tx);
    if (wait) {
      const data = JSON.parse(response);
      await waitForTx(data.id, { apiBase });
    }
    return response;
  } catch (e) {
    throw e
  }
}

export const takeSell = async ({ orderId, priceAssetAmount, priceAsset, signature, wait, apiBase }) => {
  const tx = {
    type: 16,
    data: {
      dApp: config.dApp,
      call: {
        function: 'takeSell',
        args: [
          { value: orderId, type: 'string' },
          { value: signature, type: 'string' },
        ],
      },
      fee: {
        assetId: 'WAVES',
        tokens: 0.005,
      },
      payment: [{
        coins: priceAssetAmount,
        assetId: priceAsset,
      }],
    },
  };
  try {
    const response = await window.WavesKeeper.signAndPublishTransaction(tx);
    if (wait) {
      const data = JSON.parse(response);
      await waitForTx(data.id, { apiBase });
    }
    return response;
  } catch (e) {
    throw e
  }
}

export const takeBuy = async ({ orderId, amount, amountAsset, signature, wait, apiBase }) => {
  const tx = {
    type: 16,
    data: {
      dApp: config.dApp,
      call: {
        function: 'takeBuy',
        args: [
          { value: orderId, type: 'string' },
          { value: signature, type: 'string' },
        ],
      },
      fee: {
        assetId: 'WAVES',
        tokens: 0.005,
      },
      payment: [{
        coins: amount,
        assetId: amountAsset,
      }],
    },
  };
  try {
    const response = await window.WavesKeeper.signAndPublishTransaction(tx);
    if (wait) {
      const data = JSON.parse(response);
      await waitForTx(data.id, { apiBase });
    }
    return response;
  } catch (e) {
    throw e
  }
}

export const cancelOrder = async ({ id, type, wait, apiBase }) => {
  const tx = {
    type: 16,
    data: {
      dApp: config.dApp,
      call: {
        function: `return${type === 'buy' ? 'Buy' : 'Sell'}`,
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
  try {
    const response = await window.WavesKeeper.signAndPublishTransaction(tx);
    if (wait) {
      const data = JSON.parse(response);
      await waitForTx(data.id, { apiBase });
    }
    return response;
  } catch (e) {
    throw e
  }
}

export const buyPro = async ({ unlimited, wait, apiBase }) => {
  const tx = {
    type: 16,
    data: {
      dApp: config.dApp,
      call: {
        function: 'pro',
        args: [],
      },
      fee: {
        assetId: 'WAVES',
        tokens: 0.005,
      },
      payment: [
        {
          coins: unlimited ? 50 * 10 ** 8 : 10 * 10 ** 8,
          assetId: config.OTCu
        }
      ],
    },
  };
  try {
    const response = await window.WavesKeeper.signAndPublishTransaction(tx);
    if (wait) {
      const data = JSON.parse(response);
      await waitForTx(data.id, { apiBase });
    }
    return response;
  } catch (e) {
    throw e
  }
}

export const addAsset = async ({ asset, inWaves, wait, apiBase }) => {
  const tx = {
    type: 16,
    data: {
      dApp: config.dApp,
      call: {
        function: 'addAsset',
        args: [
          { value: asset, type: 'string' },
        ],
      },
      fee: {
        assetId: 'WAVES',
        tokens: 0.005,
      },
      payment: [
        {
          coins: 100 * 10 ** 8,
          assetId: inWaves ? 'WAVES' : config.OTCu
        }
      ],
    },
  };
  try {
    const response = await window.WavesKeeper.signAndPublishTransaction(tx);
    if (wait) {
      const data = JSON.parse(response);
      await waitForTx(data.id, { apiBase });
    }
    return response;
  } catch (e) {
    throw e
  }
}

export const buyUtilityTokenDApp = async ({ amount, wait, apiBase }) => {
  const tx = {
    type: 16,
    data: {
      dApp: config.dApp,
      call: {
        function: 'buyUtilityToken',
        args: [],
      },
      fee: {
        assetId: 'WAVES',
        tokens: 0.005,
      },
      payment: [
        {
          coins: amount,
          assetId: 'WAVES'
        }
      ],
    },
  };
  try {
    const response = await window.WavesKeeper.signAndPublishTransaction(tx);
    if (wait) {
      const data = JSON.parse(response);
      await waitForTx(data.id, { apiBase });
    }
    return response;
  } catch (e) {
    throw e
  }
}

export const fetchDexStatus = async () => {
  const data = await axios.get(`${config.matcherApiBase}/matcher/orderbook/${config.OTCu}/WAVES/status`)
  return data.data
}

export const fetchDexOrderbook = async (asset1, asset2) => {
  const response = await axios.get(`${config.matcherApiBase}/matcher/orderbook/${asset1}/${asset2}`);
  return response.data;
}

export const dexBuy = async ({ amount, price, wait, apiBase }) => {
  const response = await axios.get(`${config.matcherApiBase}/matcher`);
  const matcherPublicKey = response.data;
  const time = Date.now();
  const amountAssetId = config.OTCu;
  const priceAssetId = 'WAVES';
  const order = {
    type: 1002,
    data: {
      matcherPublicKey,
      orderType: 'buy',
      expiration: time + 1000000,
      version: 1,
      amount: {
        coins: amount,
        assetId: amountAssetId
      },
      price: {
        coins: price,
        assetId: priceAssetId
      },
      matcherFee: {
        tokens: '0.003',
        assetId: 'WAVES'
      }
    }
  }
  try {
    const response = await window.WavesKeeper.signAndPublishOrder(order);
    if (wait) {
      const data = JSON.parse(response);
      // await waitForTx(data.id, { apiBase });
    }
    return response;
  } catch (e) {
    throw e
  }
}