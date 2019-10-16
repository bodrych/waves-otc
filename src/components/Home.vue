<template>
  <v-container class="d-flex flex-column py-2" style="height: 100%" fluid>
    <v-row class="d-flex flex-row px-2" style="height: 100%">
      <v-col class="d-flex flex-column pr-5 py-0" cols="2" style="height: 100%">
        <v-row style="height: 100%">
          <Pairs />
        </v-row>
      </v-col>
      <v-col cols="7" class="d-flex flex-column py-0" style="height: 100%">
        <v-row class="pb-1">
          <v-card class="d-flex flex-column flex-grow-1" style="height: 100%" outlined>
            <v-card-text class="d-flex justify-center">
              <span>{{ currentPairStatus }}</span>
            </v-card-text>
          </v-card>
        </v-row>
        <v-row class="pt-1 pb-1" style="height: calc(50% - 30px)">
          <SellOrders :items="getSellOrders" />
        </v-row>
        <v-row class="pt-1" style="height: calc(50% - 30px)">
          <BuyOrders :items="getBuyOrders" />
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
  import Pairs from './Pairs';
  import BuyOrders from './BuyOrders';
  import SellOrders from './SellOrders';
  import Account from './Account';
  // import _ from 'lodash';

  let tosser = null;

  export default {
    props: {
      pair: {
				type: Object,
				default: () => {},
			},
    },
    data: () => ({
    }),
    components: {
      Pairs,
      BuyOrders,
      SellOrders,
      Account
    },
    computed: {
      ...mapGetters(['getOrders', 'getBalance', 'getCurrentPair', 'getBuyOrders', 'getSellOrders', 'getAssets']),
      vstBalance() {
        return (this.getBalance && this.getBalance[config.assetId] && (`(balance ${this.getBalance[config.assetId]})`)) || '';
      },
      wavesBalance() {
        return (this.getBalance && this.getBalance['WAVES'] && (`(balance ${this.getBalance['WAVES']})`)) || '';
      },
      currentPairStatus() {
        let amountPart = this.getCurrentPair.amountAsset
        if (amountPart !== 'WAVES') amountPart += ` (${this.getCurrentPair.amountAssetName})`
        let pricePart = this.getCurrentPair.priceAsset
        if (pricePart !== 'WAVES') pricePart += ` (${this.getCurrentPair.priceAssetName})`
        return `${amountPart} / ${pricePart}`
      },
    },
    watch: {
      // pair: {
      //   immediate: true,
      //   async handler(value) {
      //     if (value && value.amountAsset && value.priceAsset) {
      //       await this.fetchOrders()
      //       if (this.getAssets && this.getAssets[value.amountAsset] && this.getAssets[value.priceAsset]) {
      //         this.setCurrentPair({
      //           amountAsset: value.amountAsset,
      //           amountAssetName: this.getAssets[value.amountAsset].name,
      //           priceAsset: value.priceAsset,
      //           priceAssetName: this.getAssets[value.priceAsset.name],
      //         })
      //       }
      //     }
      //   },
      // },
    },
    methods: {
      ...mapActions(['fetchOrders', 'fetchBalance', 'makeSell', 'fetchDAppBalance', 'fetchDexStatus', 'checkKeeper', 'setCurrentPair']),
      fetchData() {
        this.fetchBalance();
        this.fetchOrders();
        this.fetchDAppBalance();
        this.fetchDexStatus();
      }
    },
    mounted() {
      tosser = setInterval(() => { this.fetchData(); }, config.refreshInterval);
      this.fetchData();
      this.checkKeeper();
    },
    beforeDestroy() {
      clearInterval(tosser);
    }
  }
</script>
