import Vue from 'vue'
import Vuex from 'vuex'
import API from './api';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    orders: null,
    balance: null,
  },
  mutations: {
    updatePublicState: (state, val) => state.publicState = val,
    updateBalance: (state, val) => state.balance = val,
    updateOrders: (state, val) => state.orders = val,
  },
  actions: {
    makeVSTSellOrder(d, { price, vstAmount }) {
      return API.makeVSTSellOrder({ price, vstAmount });
    },
    makeVSTBuyOrder(d, { price, wavesAmount }) {
      return API.makeVSTBuyOrder({ price, wavesAmount });
    },
    takeVSTSellOrder(d, { orderId, wavesAmount }) {
      return API.takeVSTSellOrder({ orderId, wavesAmount });
    },
    takeVSTBuyOrder(d, { orderId, vstAmount }) {
      return API.takeVSTBuyOrder({ orderId, vstAmount });
    },
    fetchBalance({ commit, getters, dispatch }) {
      return dispatch('getPublicState')
        .then(() => API.fetchBalance(getters.getAddress))
        .then(res => commit('updateBalance', res))
        .catch(() => {});
    },
    getPublicState({ commit }) {
      return API.waitForKeeper()
        .then(() => window.WavesKeeper.publicState()
          .then(res => commit('updatePublicState', res))
          .catch(() => {}));
    },
    fetchOrders({ commit, dispatch }) {
      return dispatch('getPublicState')
        .then(() => API.fetchOrders())
        .then(res => commit('updateOrders', res))
        .catch(() => {});
    },
    cancelOrder({ commit }, { id, type }) {
      return API.cancelOrder({ id, type })
        .then(res => commit('cancelSuccess', res))
        .catch(() => {});
    },
  },
  getters: {
    getAddress: state => state.publicState && state.publicState.account && state.publicState.account.address,
    getBalance: state => state.balance,
    getOrders: state => state.orders,
  },
})
