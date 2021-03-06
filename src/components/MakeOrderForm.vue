<template>
	<v-dialog v-model="dialog" max-width="30%" :transition="false">
		<template v-slot:activator="{ on }">
			<v-btn text v-on="on">New Order</v-btn>
		</template>
		<v-card>
			<v-card-title>
				<span class="title">New {{ orderType }} order</span>
			</v-card-title>
			<v-card-text>
				<v-autocomplete
					v-model="amountAsset"
					:items="getAssetsArray"
					:item-text="(item) => item.id === 'WAVES' ? 'WAVES' : item.name + ': ' + item.id"
					item-value="id"
					label="Amount asset ID"
					:rules="[v => !!v || 'Item is required', v => v in getAssets || 'Add asset to the tradable list', v => v !== priceAsset || 'Invalid asset']"
				></v-autocomplete>
				<v-autocomplete
					v-model="priceAsset"
					:items="getAssetsArray"
					:item-text="(item) => item.id === 'WAVES' ? 'WAVES' : item.name + ': ' + item.id"
					item-value="id"
					label="Price asset ID"
					:rules="[v => !!v || 'Item is required', v => v in getAssets || 'Add asset to the tradable list', v => v !== amountAsset || 'Invalid asset']"
				></v-autocomplete>
				<v-text-field
					v-model="amount"
					label="Amount"
					:hint="amountHint"
					:rules="[v => !!v || 'Item is required', v => v > 0 && !isNaN(parseFloat(v)) || 'Invalid amount' ]"
				></v-text-field>
				<v-text-field
					v-model="price"
					label="Price"
					:rules="[v => !!v || 'Item is required', v => v > 0 && !isNaN(parseFloat(v)) || 'Invalid price']"
				></v-text-field>
				<v-text-field
					v-model="priceAssetAmount"
					label="Price asset amount"
					:hint="priceAssetAmountHint"
					:rules="[v => !!v || 'Item is required', v => v > 0 && !isNaN(parseFloat(v)) || 'Invalid price asset amount']"
				></v-text-field>
				{{ orderInfo }}
				<v-switch
					:disabled="!checkStatus"
					v-model="all"
					label="All or nothing (PRO)"
				></v-switch>
				<v-switch
					:disabled="!checkStatus"
					v-model="passwordProtected"
					label="Password protected (PRO)"
				></v-switch>
				<v-text-field
					v-if="passwordProtected"
					append-icon="mdi-autorenew"
					@click:append="password = generate()"
					v-model="password"
					label="Password"
				></v-text-field>
				<v-tooltip bottom v-if="!checkStatus">
					<template v-slot:activator="{ on }">
					<v-btn v-on="on" text @click="showUpgradeDialog">
						Upgrade to PRO
					</v-btn>
					</template>
					<span>Get access to take-all-or-nothing and password protected orders</span>
				</v-tooltip>
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn text @click="create" :loading="createLoading">Create</v-btn>
				<v-btn text @click="dialog = false">Close</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex';
	import utils from '@/utils'
	import _ from 'lodash';

	export default {
		props: {
			orderType: {
				type: String,
				default: 'buy',
			},
		},
		components: {
		},
		data() {
			return {
				passwordProtected: false,
				dialog: false,
				amountAsset: null,
				priceAsset: null,
				amount: 1,
				price: 1,
				priceAssetAmount: 1,
				all: false,
				password: this.generate(),
				assetsArray: [],
				createLoading: false,
			}
		},
		watch: {
			price(value) {
				if (!isNaN(this.amount) && !isNaN(value))
					this.priceAssetAmount = parseFloat((this.amount * value).toFixed(this.getAssets[this.priceAsset].decimals))
			},
			amount(value) {
				if (!isNaN(this.amount) && !isNaN(value))
					this.priceAssetAmount = parseFloat((this.price * value).toFixed(this.getAssets[this.priceAsset].decimals))
			},
			priceAssetAmount(value) {
				if (!isNaN(this.amount) && !isNaN(value) && this.amount > 0)
					this.price = parseFloat((value / this.amount).toFixed(this.getAssets[this.priceAsset].decimals))
			},
			getCurrentPair: {
				immediate: true,
				handler(value) {
					this.amountAsset = value.amountAsset;
					this.priceAsset = value.priceAsset;
				}
			},
			checkStatus(value) {
				if (!value) {
					this.passwordProtected = false;
					this.all = false;
				}
			},
		},
		computed: {
			...mapGetters([
				'getCurrentPair',
				'getAssets',
				'getAssetsArray',
				'checkStatus',
				'getBalance',
				'getAssetBalanceFloat',
				'getApiBase',
			]),
			orderInfo() {
				return `${_.capitalize(this.orderType)} ${this.amount} ${this.getAssets[this.amountAsset].name} for ${this.priceAssetAmount} ${this.getAssets[this.priceAsset].name}`;
			},
			amountHint() {
				if (this.orderType === 'sell') {
					return 'Max: ' + this.getAssetBalanceFloat(this.amountAsset)
				} else {
					return ''
				}
			},
			priceAssetAmountHint() {
				if (this.orderType === 'buy') {
					return 'Max: ' + this.getAssetBalanceFloat(this.priceAsset)
				} else {
					return ''
				}
			},
		},
		methods: {
			...mapActions([
				'makeSell',
				'makeBuy',
				'showUpgradeDialog',
				'fetchOrders',
			]),
			generate() {
				return utils.randomValue(16)
			},
			itemText(item) {
				return item.id === 'WAVES' ? 'WAVES' : item.name + ': ' + item.id;
			},
			async create() {
				try {
					this.createLoading = true;
					let pk = '';
					if (this.passwordProtected) {
						const kp = utils.keyPair(this.password)
						pk = kp.publicKey
					}
					const params = {
						amount: parseFloat(this.amount) * 10 ** this.getAssets[this.amountAsset].decimals,
						amountAsset: this.amountAsset || this.getCurrentPair.amountAsset,
						priceAssetAmount: parseFloat(this.priceAssetAmount) * 10 ** this.getAssets[this.priceAsset].decimals,
						priceAsset: this.priceAsset || this.getCurrentPair.priceAsset,
						all: this.all,
						password: pk,
						wait: true,
					}
					this.orderType === 'sell' ? await this.makeSell(params) : await this.makeBuy(params);
					await this.fetchOrders();
					this.createLoading = false;
				} catch (e) {
					this.createLoading = false;
					this.$notify({ type: 'error', text: e.message });
				}
			},
		},
	}
</script>