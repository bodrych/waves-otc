import Vue from 'vue'
import Vuex from 'vuex'
import * as API from './api';
import config from '@/config';
import _ from 'lodash';
// import VuexPersistence from 'vuex-persist'

Vue.use(Vuex)

// const persist = new VuexPersistence({
//   reducer: (state) => ({
//     publicState: state.publicState,
//   }),
// })

export default new Vuex.Store({
  state: {
    login: false,
    publicState: null,
    assets: {
      'WAVES': {
        id: 'WAVES',
        name: 'WAVES',
        decimals: 8,
      },
      '4LHHvYGNKJUg5hj65aGD5vgScvCBmLpdRFtjokvCjSL8': {
        id: '4LHHvYGNKJUg5hj65aGD5vgScvCBmLpdRFtjokvCjSL8',
        name: 'Vostok',
        decimals: 8,
      }
    },
    orders: [],
    balance: null,
    dAppBalance: null,
    dexStatus: {},
    currentPair: {
      amountAsset: '4LHHvYGNKJUg5hj65aGD5vgScvCBmLpdRFtjokvCjSL8',
      amountAssetName: 'Vostok',
      priceAsset: 'WAVES',
      priceAssetName: 'WAVES',
    },
    status: {
      unlimited: false,
      deadline: 0,
    },
    dexOrderbook: {
      bids: [],
      asks: [],
    },
    upgradeDialogDisplay: false,
    orderTakeDialogDisplay: false,
    takeOrder: {},
  },
  mutations: {
    updatePublicState: (state, val) => state.publicState = val,
    updateBalance: (state, val) => state.balance = val,
    updateDAppBalance: (state, val) => state.dAppBalance = val,
    updateOrders: (state, val) => state.orders = val,
    updateAssets: (state, val) => {
      if (!_.isEqual(val, state.assets)) state.assets = val;
    },
    setCurrentPair: (state, val) => state.currentPair = val,
    setLogin: (state, val) => state.login = val,
    updateStatus: (state, val) => state.status = val,
    updateDexStatus: (state, val) => state.dexStatus = val,
    updateDexOrderbook: (state, val) => state.dexOrderbook = val,
    setUpgradeDialogDisplay: (state, val) => state.upgradeDialogDisplay = val,
    setOrderTakeDialogDisplay: (state, val) => state.orderTakeDialogDisplay = val,
    setTakeOrder: (state, val) => state.takeOrder = val,
  },
  actions: {
    async checkKeeper({ dispatch }) {
      if (!window.WavesKeeper) {
        Vue.notify({ type: 'error', text: 'Install Waves Keeper' });
        return null;
      }
      try {
        await window.WavesKeeper.initialPromise;
        window.WavesKeeper.on('update', state => dispatch('listenKeeper', { data: state }));
        const data = await window.WavesKeeper.publicState();
        await dispatch('listenKeeper', { data });
      } catch (e) {
        Vue.notify({ type: 'error', text: e.message || 'Error' });
      }
    },
    
    async listenKeeper({ commit, dispatch }, { data }) {
      if (data.network.code !== config.chainId) {
        Vue.notify({ type: 'error', text: 'Change network' });
        return null;
      }
      if (!data.initialized) {
        Vue.notify({ type: 'error', text: 'Create account' });
        return null;
      }
      commit('setLogin', true);
      commit('updatePublicState', data);
      await dispatch('fetchAddressStatus');
      await dispatch('fetchBalance');
    },
    
    makeSell(ctx, { amount, amountAsset, priceAssetAmount, priceAsset, all, password }) {
      return API.makeSell({ amount, amountAsset, priceAssetAmount, priceAsset, all, password });
    },
    
    makeBuy(ctx, { amount, amountAsset, priceAssetAmount, priceAsset, all, password }) {
      return API.makeBuy({ amount, amountAsset, priceAssetAmount, priceAsset, all, password });
    },
    
    takeSell(ctx, { orderId, priceAssetAmount, priceAsset, signature }) {
      return API.takeSell({ orderId, priceAssetAmount, priceAsset, signature });
    },

    takeBuy(ctx, { orderId, amount, amountAsset, signature }) {
      return API.takeBuy({ orderId, amount, amountAsset, signature });
    },

    buyPro(ctx, unlimited) {
      return API.buyPro(unlimited);
    },

    buyUtilityTokenDApp(ctx, amount) {
      return API.buyUtilityTokenDApp(amount);
    },

    async fetchBalance({ commit, getters }) {
      if (getters.getAddress) {
        const res = await API.fetchBalance(getters.getAddress);
        commit('updateBalance', res);
      }
    },

    async fetchDAppBalance({ commit }) {
      const res = await API.fetchDAppBalance();
      commit('updateDAppBalance', res);
    },

    async fetchAvailableAssetsDetails({ commit }) {
      const assetsDetails = await API.fetchAvailableAssetsDetails();
      commit('updateAssets', assetsDetails);
    },

    async fetchOrders({ commit, dispatch }) {
      await dispatch('fetchAvailableAssetsDetails');
      const orders = await API.fetchOrders();
      commit('updateOrders', orders);
    },

    cancelOrder(ctx, { id, type }) {
      return API.cancelOrder({ id, type });
    },

    async fetchAddressStatus({ commit, getters }) {
      const status = await API.fetchAddressStatus(getters.getAddress);
      if (status) commit('updateStatus', status);
    },

    async fetchDexOrderbook({ commit }) {
      const res = await API.fetchDexOrderbook(config.OTCu, 'WAVES');
      commit('updateDexOrderbook', res);
    },

    async fetchDexStatus({ commit }) {
      try {
        const dexStatus = await API.fetchDexStatus();
        commit('updateDexStatus', dexStatus);
      } catch(e) {
        throw e;
      }
    },

    addAsset(ctx, { asset, inWaves }) {
      return API.addAsset({ asset, inWaves });
    },

    dexBuy(ctx, { amount, price }) {
      return API.dexBuy({ amount, price });
    },

    async showUpgradeDialog({ commit, dispatch }) {
      commit('setUpgradeDialogDisplay', true);
      await dispatch('fetchDexOrderbook');
      await dispatch('fetchDAppBalance');
    },

    closeUpgradeDialog({ commit }) {
      commit('setUpgradeDialogDisplay', false);
    },

    showOrderTakeDialog({ commit }, { order }) {
      commit('setOrderTakeDialogDisplay', true);
      commit('setTakeOrder', order);
    },

    closeOrderTakeDialog({ commit }) {
      commit('setOrderTakeDialogDisplay', false);
    },
  },
  getters: {
    getAddress: state => state.publicState && state.publicState.account && state.publicState.account.address,
    getPublicKey: state => state.publicState && state.publicState.account && state.publicState.account.publicKey,
    getBalance: state => state.balance,
    getOrders: (state, getters) => {
      return _.map(state.orders, item => {
        const parts = item.value.split('_');
        const id = item.key;
        const type = parts[0];
        const totalAmount = parseInt(parts[1]);
        const amountAsset = parts[2];
        const amountAssetName = getters.getAssets[amountAsset].name;
        const totalPriceAssetAmount = parseInt(parts[3]);
        const priceAsset = parts[4];
        const priceAssetName = getters.getAssets[priceAsset].name;
        const spent = parseInt(parts[8]);
        const price = totalPriceAssetAmount / totalAmount;
        
        const amount = type === 'sell' ? totalAmount - spent : (totalPriceAssetAmount - spent) / price;
        const amountFmt = parseFloat((amount / (10 ** getters.getAssets[amountAsset].decimals)).toFixed(getters.getAssets[amountAsset].decimals));
        
        const priceAssetAmount = type === 'buy' ? totalPriceAssetAmount - spent : (totalAmount - spent) * price;
        const priceAssetAmountFmt = parseFloat((priceAssetAmount / (10 ** getters.getAssets[priceAsset].decimals)).toFixed(getters.getAssets[priceAsset].decimals));
        
        const owner = parts[5];
        const all = parts[6] === 'true' ? true : false;
        const password = parts[7];
        const priceFmt = parseFloat((price * (10 ** getters.getAssets[amountAsset].decimals) / (10 ** getters.getAssets[priceAsset].decimals)).toFixed(getters.getAssets[priceAsset].decimals));
        
        return {
          id, type,
          totalAmount, amount, amountFmt, amountAsset, amountAssetName, 
          totalPriceAssetAmount, priceAssetAmount, priceAssetAmountFmt, priceAsset, priceAssetName,
          owner, all, password, spent, price, priceFmt, };
        });
      },
      getCurrentPair: state => state.currentPair,
      getPairs: (state, getters) => _.uniqBy(getters.getOrders, item => item.amountAsset + item.priceAsset),
      getSellOrders: (state, getters) => {
        return _.filter(getters.getOrders, order => {
          return order.type === 'sell' && order.amountAsset === state.currentPair.amountAsset && order.priceAsset === state.currentPair.priceAsset
        });
      },
      getBuyOrders: (state, getters) => {
        return _.filter(getters.getOrders, order => {
          return order.type === 'buy' && order.amountAsset === state.currentPair.amountAsset && order.priceAsset === state.currentPair.priceAsset
        });
      },
      getLogin: state => state.login,
      getAssets: state => state.assets,
      getAssetsArray: (state, getters) => _.chain(getters.getAssets).values().sortBy('name').value(),
      checkStatus: state => state.status.unlimited || state.status.deadline > (new Date()).getTime(),
      getStatus: state => state.status,
      getDexStatus: state => state.dexStatus,
      getDAppBalance: state => state.dAppBalance,
      getDexOrderbook: state => state.dexOrderbook,
      getDexSuitableAmount: state => _.chain(state.dexOrderbook.asks).filter(ask => ask.price <= 10 ** 8).sumBy('amount').value(),
      checkRequiredAmount: (state, getters) => requiredAmount => {
        const amount = requiredAmount * 10 ** 8;
        return {
          userOTCu: getters.getLogin && getters.getBalance ? getters.getBalance[config.OTCu] >= amount : true,
          userWaves: getters.getLogin && getters.getBalance? getters.getBalance['WAVES'] >= amount : true,
          dex: getters.getDexSuitableAmount >= 0,
          dApp: getters.getDexSuitableAmount >= amount,
        }
      },
      uTokenRefill: (state, getters) => requiredAmount => {
        const check = getters.checkRequiredAmount(requiredAmount);
        return {
          showAlert: !check.userOTCu && !check.dex && !check.dApp && !check.userWaves,
          showBuyDex: !check.userOTCu && check.dex,
          showBuyDApp: !check.userOTCu && !check.dex && check.dApp,
          inWaves: !check.userOTCu && !check.dex && !check.dApp && check.userWaves,
        }
      },
      calcDexBuyData: (state, getters) => amount => {
        const data = getters.getDexOrderbook;
        const maxBuyAmount = _.sumBy(data.asks, 'amount');
        let price = 0
        let targetAmount = amount
        let priceAssetAmount = 0
        const asks = data.asks
        for (let a = 0; a < asks.length; a++) {
          price = asks[a].price
          if (targetAmount <= asks[a].amount) {
            priceAssetAmount += Math.trunc(targetAmount * price / 10 ** 8)
            targetAmount = 0
          } else {
            priceAssetAmount += Math.trunc(asks[a].amount * price / 10 ** 8)
            targetAmount -= asks[a].amount
          }
          if (targetAmount === 0) {
            break
          }
        }
        return {
          maxBuyAmount,
          price,
          priceAssetAmount,
        }
      },
      upgradeDialogDisplay: state => state.upgradeDialogDisplay,
      orderTakeDialogDisplay: state => state.orderTakeDialogDisplay,
      getTakeOrder: state => state.takeOrder,
    },
    // plugins: [persist.plugin]
  })
  