<template>
  <v-container>
    <v-card-text>
      <v-btn
        color="primary"
        @click.prevent="newOrder"
        class="mx-1" small><i class="fa fa-edit"></i> new order
      </v-btn>
    </v-card-text>
    <v-card class="mb-2">
      <v-card-text>
      <v-data-table :items="filteredItems" :headers="headers">
        <template v-slot:item.action="{ item }">
          <v-btn
            @click.prevent="openOrder(item)"
            class="mx-1" small>
            <i class="fa fa-shopping-cart"></i>
          </v-btn>
          <v-btn
            @click.prevent="doCancelOrder(item)"
            class="mx-1" small :disabled="(item.owner !== getAddress) || (item.amount < 0.0000001)"><i class="fa fa-sign-out"></i>
          </v-btn>
        </template>
      </v-data-table>
      </v-card-text>
    </v-card>
    <v-dialog v-model="showDialog" max-width="400">
      <v-card>
        <v-card-title class="headline">{{ isNewOrder ? 'Make new order' : 'You taking existing order' }}</v-card-title>
        <v-card-text>
          <v-select label="buy or sell VST for WAVES" v-model="dealType" :disabled="!isNewOrder" :items="dealTypes"></v-select>
          <v-text-field v-model="price" label="price" :disabled="!isNewOrder"></v-text-field>
          <v-text-field v-model="vstAmount" :label="`VST amount ${vstBalance}`"></v-text-field>
          <v-text-field v-model="wavesAmount" :label="`WAVES amount ${wavesBalance}`"></v-text-field>
          <v-btn
            @click.prevent="submitOrder"
            :disabled="!verifyOrder">Submit
          </v-btn>
          <v-btn class="mx-2"
            @click.prevent="hideDialog">Close
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex';
  import _ from 'lodash';
  import config from '../config';

  export default {
    props: {
      items: {
        type: Array,
        default: () => [],
      },
    },
    computed: {
      ...mapGetters(['getAddress']),
      verifyOrder() {
        return this.dealType && !isNaN(this.price) && !isNaN(this.vstAmount) && !isNaN(this.wavesAmount);
      },
      isNewOrder() {
        return this.editOrder === 'new';
      },
      vstBalance() {
        return (this.getBalance && this.getBalance[config.assetId] && (`(balance ${this.getBalance[config.assetId]})`)) || '';
      },
      wavesBalance() {
        return (this.getBalance && this.getBalance['WAVES'] && (`(balance ${this.getBalance['WAVES']})`)) || '';
      },
      filteredItems() {
        const items = [];
        _.forEach(this.items, (order) => {
          const amountLeft = order.amount - order.spent;
          if (amountLeft > 0) {
            items.push({
              ...order,
              amount: amountLeft / config.decimalsMul,
              price: order.price / config.decimalsMul,
              total: amountLeft * order.price / config.decimalsMul / config.decimalsMul,
            });
          }
        });
        return items;
      },
      showDialog: {
        get() {
          return !!this.editOrder;
        },
        set(val) {
          this.editOrder = val;
        },
      },
    },
    methods: {
      ...mapActions(['cancelOrder', 'fetchBalance', 'makeVSTSellOrder', 'takeVSTSellOrder', 'makeVSTBuyOrder', 'takeVSTBuyOrder']),
      hideDialog() {
        this.editOrder = false;
      },
      submitOrder() {
        if (this.editOrder === 'new') {
          if (this.dealType === 'sell') {
            this.makeVSTSellOrder({ price: this.price, vstAmount: this.vstAmount })
              .then(() => { this.hideDialog() });
          }
          if (this.dealType === 'buy') {
            this.makeVSTBuyOrder({ price: this.price, wavesAmount: this.wavesAmount })
              .then(() => { this.hideDialog() });
          }
        } else {
          if (this.dealType === 'sell') {
            this.takeVSTSellOrder({ orderId: this.editOrder, wavesAmount: this.wavesAmount })
              .then(() => { this.hideDialog() });
          }
          if (this.dealType === 'buy') {
            this.takeVSTBuyOrder({ orderId: this.editOrder, vstAmount: this.vstAmount })
              .then(() => { this.hideDialog() });
          }
        }
      },
      doCancelOrder(order) {
        this.cancelOrder({ id: order.id, type: order.type });
      },
      newOrder() {
        this.price = 1;
        this.vstAmount = 1;
        this.editOrder = 'new';
        this.dealType = null;
      },
      openOrder(item) {
        this.price = item.price;
        this.vstAmount = item.amount;
        this.editOrder = item.id;
        this.dealType = item.type;
      },
    },
    data() {
      return {
        headers: [
          { text: 'Type', value: 'type' },
          { text: 'Owner', value: 'owner' },
          { text: 'Price', value: 'price' },
          { text: 'VST', value: 'amount' },
          { text: 'WAVES', value: 'total' },
          { text: '', value: 'action' },
        ],
        dealTypes: [
          { value: 'buy', text: 'buy VST for WAVES' },
          { value: 'sell', text: 'sell VST for WAVES' },
        ],
        editOrder: false,
        price: 1,
        vstAmount: 1,
        wavesAmount: 1,
        dealType: null,
      };
    },
    watch: {
      price(newVal) {
        const a = Math.round(newVal * this.vstAmount * config.decimalsMul) / config.decimalsMul;
        isNaN(a) || (this.wavesAmount = a);
      },
      vstAmount(newVal, oldVal) {
        if (!isNaN(newVal) && Math.abs(oldVal - newVal) > 0.0001) {
          const a = Math.round(newVal * this.price * config.decimalsMul) / config.decimalsMul;
          isNaN(a) || (this.wavesAmount = a);
        }
      },
      wavesAmount(newVal, oldVal) {
        if (!isNaN(newVal) && Math.abs(oldVal - newVal) > 0.0001) {
          const a = Math.round(newVal / this.price * config.decimalsMul) / config.decimalsMul;
          isNaN(a) || (this.vstAmount = a);
        }
      },
    },
  }
</script>
