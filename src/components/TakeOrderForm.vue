<template>
	<v-dialog v-model="dialogDisplay" max-width="30%" :transition="false">
		<v-card>
			<v-card-title>
				<span class="title">Take {{ getTakeOrder.type }} order</span>
			</v-card-title>
			<v-card-text>
				<v-text-field 
					:value="getTakeOrder.amountAsset"
					label="Amount asset ID"
					readonly
				></v-text-field>
				<v-text-field
					:value="getTakeOrder.priceAsset"
					label="Price asset ID"
					readonly
				></v-text-field>
				<v-text-field
					v-model="amount"
					label="Amount"
					:rules="[v => !!v || 'Item is required', v => v > 0 && !isNaN(parseFloat(v)) || 'Invalid amount' ]"
				></v-text-field>
				<v-text-field
					:value="getTakeOrder.priceFmt"
					label="Price"
					readonly
				></v-text-field>
				<v-text-field
					v-model="priceAssetAmount"
					label="Price asset amount"
					:rules="[v => !!v || 'Item is required', v => v > 0 && !isNaN(parseFloat(v)) || 'Invalid price asset amount']"
				></v-text-field>
				<v-text-field
					v-if="getTakeOrder.password !== ''"
					v-model="password"
					label="Password"
				></v-text-field>
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn text color="primary" @click.stop="take">Take</v-btn>
				<v-btn text color="primary" @click.stop="closeOrderTakeDialog">Close</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex';
	import utils from '../utils'

	export default {
		components: {
		},
		data() {
			return {
				amount: null,
				priceAssetAmount: null,
				password: '',
			}
		},
		watch: {
			amount(value) {
				if (!isNaN(this.amount) && !isNaN(value))
					this.priceAssetAmount = parseFloat((this.getTakeOrder.priceFmt * value).toFixed(this.getAssets[this.getTakeOrder.priceAsset].decimals))
			},
			priceAssetAmount(value) {
				if (!isNaN(this.amount) && !isNaN(value) && this.amount > 0)
					this.amount = parseFloat((value / this.getTakeOrder.priceFmt).toFixed(this.getAssets[this.getTakeOrder.amountAsset].decimals))
			},
			getTakeOrder: {
				immediate: true,
				handler(value) {
					this.amount = value.amountFmt;
					this.priceAssetAmount = value.priceAssetAmountFmt;
				}
			},
		},
		computed: {
			...mapGetters(['getCurrentPair', 'getAssets', 'checkStatus', 'getPublicKey', 'getTakeOrder', 'orderTakeDialogDisplay']),
			dialogDisplay: {
				get() {
					return this.orderTakeDialogDisplay;
				},
				set(value) {
					if (value === false) this.closeOrderTakeDialog();
				}
			},
		},
		methods: {
			...mapActions(['takeSell', 'takeBuy', 'closeOrderTakeDialog']),
			async take() {
				let signature = '';
				if (this.getTakeOrder.password !== '') {
					const kp = utils.keyPair(this.password);
					signature = utils.signBytes({ privateKey:  kp.privateKey }, this.getPublicKey);
				}
				let params = {};
				if (this.getTakeOrder.type === 'sell') {
					params = {
						orderId: this.getTakeOrder.id,
						priceAssetAmount: this.priceAssetAmount * 10 ** this.getAssets[this.getTakeOrder.priceAsset].decimals,
						priceAsset: this.getTakeOrder.priceAsset,
						signature,
					}
				} else {
					params = {
						orderId: this.getTakeOrder.id,
						amount: this.amount  * 10 ** this.getAssets[this.getTakeOrder.amountAsset].decimals,
						amountAsset: this.getTakeOrder.amountAsset,
						signature,
					}
				}
				try {
					this.getTakeOrder.type === 'sell' ? await this.takeSell(params) : await this.takeBuy(params);
				} catch (e) {
					this.$notify({ type: 'error', text: e.message });
				}
			}
		},
	}
</script>