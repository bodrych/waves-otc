<template>
  <v-container class="d-flex flex-column py-2" style="height: 100%" fluid>
    <v-row class="d-flex flex-row px-2" style="height: 100%">
      <v-col class="d-flex flex-column pr-5 py-0" cols="3" style="height: 100%">
        <v-row style="height: 100%">
          <Pairs />
        </v-row>
      </v-col>
      <v-col cols="6" class="d-flex flex-column py-0">
        <v-row class="flex-grow-0 pb-1">
          <v-card class="d-flex flex-column flex-grow-1" outlined>
            <v-card-text>
              Info about current pair
            </v-card-text>
          </v-card>
        </v-row>
        <v-row class="pb-1 pt-1">
          <BuyOrders />
        </v-row>
        <v-row class="pt-1">
          <SellOrders />
        </v-row>
      </v-col>
      <v-col class="d-flex flex-column pl-5 py-0" cols="3" style="height: 100%">
        <v-row class="flex-grow-1" style="height: 100%">
          <Account />
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex';
  import config from '../config';
  import Pairs from "./Pairs";
  import BuyOrders from "./BuyOrders";
  import SellOrders from "./SellOrders";
  import Account from "./Account";
  import _ from 'lodash';

  let tosser = null;

  export default {
    data: () => ({
    }),
    components: {
      Pairs,
      BuyOrders,
      SellOrders,
      Account
    },
    computed: {
      ...mapGetters(['getOrders', 'getBalance']),
      buyItems() {
        return _.filter(this.getOrders, order => order.type === 'buy');
      },
      sellItems() {
        return _.filter(this.getOrders, order => order.type === 'sell');
      },
      vstBalance() {
        return (this.getBalance && this.getBalance[config.assetId] && (`(balance ${this.getBalance[config.assetId]})`)) || '';
      },
      wavesBalance() {
        return (this.getBalance && this.getBalance['WAVES'] && (`(balance ${this.getBalance['WAVES']})`)) || '';
      },
    },
    methods: {
      ...mapActions(['fetchOrders', 'fetchBalance']),
      fetchData() {
        this.fetchBalance();
        this.fetchOrders();
      }
    },
    mounted() {
      tosser = setInterval(() => { this.fetchData(); }, config.ordersRefreshInterval);
      this.fetchData();
    },
    beforeDestroy() {
      clearInterval(tosser);
    }
  }
</script>
