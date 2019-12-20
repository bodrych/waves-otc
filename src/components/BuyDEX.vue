<template>
	<v-alert :icon="false" outlined>
		You don't have enough OTCu. You can get it from DEX.
		<v-text-field
            v-model="amount"
            label="Amount"
            suffix="OTCu"
            :rules="[
                v => !!v || 'Item is required',
                v => v > 0 && !isNaN(parseFloat(v)) || 'Invalid amount',
                v => v <= +(dexMaxBuyAmount / 10 ** 8).toFixed(8) || 'Max: ' + +(dexMaxBuyAmount / 10 ** 8).toFixed(8)
            ]"
        ></v-text-field>
        <v-text-field
            v-model="dexPrice"
            label="Price"
            suffix="WAVES"
            readonly
        ></v-text-field>
        <v-text-field
            v-model="dexPriceAssetAmount"
            label="You will pay"
            suffix="WAVES"
            readonly
        ></v-text-field>
		<v-btn text @click="buyOTCuFromDex" :loading="buyLoading">Buy</v-btn>
	</v-alert>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex';

	export default {
		props: {
			targetAmount: {
				type: Number,
				required: true,
			},
		},
		components: {
		},
		data() {
			return {
                amount: this.targetAmount,
                dexData: {},
                dexPriceAssetAmount: 0,
                dexPrice: 0,
				dexMaxBuyAmount: 0,
				buyLoading: false,
			}
		},
		watch: {
			targetAmount(value) {
				this.amount = value;
				if (this.buyLoading) this.buyLoading = false;
			},
			amount: {
				immediate: true,
				async handler(amount) {
					await this.fetchDexOrderbook();
					this.dexData = this.calcDexBuyData(amount * 10 ** 8);
					this.dexPriceAssetAmount = +(this.dexData.priceAssetAmount / 10 ** 8).toFixed(8)
					this.dexPrice = +(this.dexData.price / 10 ** 8).toFixed(8)
					this.dexMaxBuyAmount = this.dexData.maxBuyAmount
				}
			},
		},
		computed: {
			...mapGetters(['getLogin', 'getDexStatus', 'calcDexBuyData']),
		},
		methods: {
			...mapActions(['fetchDexOrderbook', 'dexBuy']),
			async buyOTCuFromDex() {
				try {
					this.buyLoading = true;
					await this.dexBuy({
						amount: this.amount * 1e8,
						price: this.dexData.price,
					})
					// this.buyLoading = false;
				} catch(e) {
					this.buyLoading = false;
					this.$notify({ type: 'error', text: e.message || 'Error' });
				}
			},
		},
	}
</script>