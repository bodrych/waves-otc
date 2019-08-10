<template>
  <v-container>
    <v-card class="mb-2">
      <v-card-text>
        <v-btn
          color="primary"
          @click.prevent="newOrder"
          class="mx-1" small><i class="fa fa-edit"></i> new order
        </v-btn>
      </v-card-text>
      <v-card-text>
        <div>VST {{ vstBalance }}</div>
        <div>WAVES {{ wavesBalance }}</div>
      </v-card-text>
    </v-card>
    <TradeTable :items="buyItems"></TradeTable>
    <TradeTable :items="sellItems"></TradeTable>
  </v-container>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex';
  import config from '../config';
  import TradeTable from "./TradeTable";
  import _ from 'lodash';

  let tosser = null;

  export default {
    components: {TradeTable},
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
