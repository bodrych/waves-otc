import Vue from 'vue'
import Vuex from 'vuex'
import * as API from './api';
import config from '@/config';
import _ from 'lodash';
import VuexPersistence from 'vuex-persist'

Vue.use(Vuex)

const persist = new VuexPersistence({
  reducer: (state) => ({
    darkTheme: state.darkTheme,
  }),
})

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
    balance: {
      '4LHHvYGNKJUg5hj65aGD5vgScvCBmLpdRFtjokvCjSL8': 0,
      'WAVES': 0,
    },
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
    darkTheme: false,
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
    setDarkTheme: (state, val) => state.darkTheme = val,
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
    makeSell({ getters }, params) {
      return API.makeSell({ ...params, apiBase: getters.getApiBase });
    },
    makeBuy({ getters }, params) {
      return API.makeBuy({ ...params, apiBase: getters.getApiBase });
    },
    takeSell({ getters }, params) {
      return API.takeSell({ ...params, apiBase: getters.getApiBase });
    },
    takeBuy({ getters }, params) {
      return API.takeBuy({ ...params, apiBase: getters.getApiBase });
    },
    buyPro({ getters }, params) {
      return API.buyPro({ ...params, apiBase: getters.getApiBase });
    },
    buyUtilityTokenDApp({ getters }, params) {
      return API.buyUtilityTokenDApp({ ...params, apiBase: getters.getApiBase });
    },
    setCurrentPair({ commit }, pair) {
      commit('setCurrentPair', pair)
    },
    async fetchBalance({ commit, getters }) {
      if (getters.getAddress) {
        const res = await API.fetchBalance(getters.getAddress, getters.getApiBase);
        commit('updateBalance', res);
      }
    },
    async fetchDAppBalance({ commit, getters }) {
      const res = await API.fetchDAppBalance(getters.getApiBase);
      commit('updateDAppBalance', res);
    },
    async fetchAvailableAssetsDetails({ commit, getters }) {
      const assetsDetails = await API.fetchAvailableAssetsDetails(getters.getApiBase);
      commit('updateAssets', assetsDetails);
    },
    async fetchOrders({ commit, dispatch, getters }) {
      await dispatch('fetchAvailableAssetsDetails');
      const orders = await API.fetchOrders(getters.getApiBase);
      commit('updateOrders', orders);
    },
    cancelOrder({ getters }, params) {
      return API.cancelOrder({ ...params, apiBase: getters.getApiBase });
    },
    async fetchAddressStatus({ commit, getters }) {
      const status = await API.fetchAddressStatus(getters.getAddress, getters.getApiBase);
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
    addAsset({ getters }, params) {
      return API.addAsset({ ...params, apiBase: getters.getApiBase });
    },
    dexBuy({ getters }, params) {
      return API.dexBuy({ ...params, apiBase: getters.getApiBase });
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
    setDarkTheme({ commit }, value) {
      commit('setDarkTheme', value);
    }
  },

  getters: {
    getApiBase: state => state.publicState && state.publicState.network && state.publicState.network.server || config.apiBase,
    getAddress: state => state.publicState && state.publicState.account && state.publicState.account.address,
    getPublicKey: state => state.publicState && state.publicState.account && state.publicState.account.publicKey,
    getBalance: state => state.balance,
    getAssetBalanceFloat: (state, getters) => assetId => getters.getLogin ? +(getters.getBalance[assetId] / 10 ** getters.getAssets[assetId].decimals).toFixed(getters.getAssets[assetId].decimals) : 0,
    getOrders: (state, getters) => _.map(state.orders, item => {
      const parts = item.value.split('_');
      const id = item.key.split('_')[1];
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
      }),
    getOpenOrders: (state, getters) => _.filter(getters.getOrders, item => item.amount !== 0),
    getCurrentPair: state => state.currentPair,
    getPairs: (state, getters) => _.uniqBy(getters.getOrders, item => item.amountAsset + item.priceAsset),
    getSellOrders: (state, getters) => _.filter(getters.getOpenOrders, order => {
      return order.type === 'sell' && order.amountAsset === state.currentPair.amountAsset && order.priceAsset === state.currentPair.priceAsset
    }),
    getBuyOrders: (state, getters) => _.filter(getters.getOpenOrders, order => {
      return order.type === 'buy' && order.amountAsset === state.currentPair.amountAsset && order.priceAsset === state.currentPair.priceAsset
    }),
    getLiquidity: (state, getters) => {
      let liquidity = {};
      _.each(getters.getOpenOrders, order => {
        if (order.type === 'sell') {
          if (!liquidity[order.amountAsset]) {
            liquidity[order.amountAsset] = {
              id: order.amountAsset,
              name: getters.getAssets[order.amountAsset].name,
              sell: 0,
              buy: 0,
              sum() { return this.sell + this.buy },
            }
          }
          liquidity[order.amountAsset]['sell'] += order.amountFmt;
        } else if (order.type === 'buy') {
          if (!liquidity[order.priceAsset]) {
            liquidity[order.priceAsset] = {
              id: order.priceAsset,
              name: getters.getAssets[order.priceAsset].name,
              sell: 0,
              buy: 0,
              sum() { return this.sell + this.buy },
            }
          }
          liquidity[order.priceAsset]['buy'] += order.priceAssetAmountFmt;
        }
      });
      return liquidity;
    },
    getLiquidityArray: (state, getters) => _.chain(getters.getLiquidity).values().orderBy([(item) => item.sum()], ['desc']).value(),
    getLogin: state => state.login,
    getAssets: state => state.assets,
    getAssetsArray: (state, getters) => _.chain(getters.getAssets).values().sortBy('name').value(),
    checkStatus: state => state.status.unlimited || state.status.deadline > (new Date()).getTime(),
    getStatus: state => state.status,
    getDexStatus: state => state.dexStatus,
    getDAppBalance: state => state.dAppBalance,
    getDexOrderbook: state => state.dexOrderbook,
    getDexSuitableAmount: state => _.chain(state.dexOrderbook.asks).filter(ask => ask.price <= 1e8).sumBy('amount').value(),
    checkRequiredAmount: (state, getters) => requiredAmount => {
      const amount = requiredAmount * 1e8;
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
          priceAssetAmount += Math.trunc(targetAmount * price / 1e8)
          targetAmount = 0
        } else {
          priceAssetAmount += Math.trunc(asks[a].amount * price / 1e8)
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
    getDarkTheme: state => state.darkTheme,
  },

  plugins: [persist.plugin]
})
  