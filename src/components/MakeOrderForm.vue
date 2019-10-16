<template>
	<v-dialog v-model="dialog" max-width="30%" :transition="false">
		<template v-slot:activator="{ on }">
			<v-btn text color="primary" dark v-on="on">New Order</v-btn>
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
					:rules="[v => !!v || 'Item is required', v => v in getAssets || 'Add asset to the tradable list']"
				></v-autocomplete>
				<!-- <v-text-field 
					v-model="amountAsset"
					label="Amount asset ID"
					:rules="[v => !!v || 'Item is required', v => v in getAssets || 'Add asset to the tradable list']"
				></v-text-field> -->
				<v-autocomplete
					v-model="priceAsset"
					:items="getAssetsArray"
					:item-text="(item) => item.id === 'WAVES' ? 'WAVES' : item.name + ': ' + item.id"
					item-value="id"
					label="Price asset ID"
					:rules="[v => !!v || 'Item is required', v => v in getAssets || 'Add asset to the tradable list']"
				></v-autocomplete>
				<!-- <v-text-field
					v-model="priceAsset"
					label="Price asset ID"
					:rules="[v => !!v || 'Item is required', v => v in getAssets || 'Add asset to the tradable list']"
				></v-text-field> -->
				<v-text-field
					v-model="amount"
					label="Amount"
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
					:rules="[v => !!v || 'Item is required', v => v > 0 && !isNaN(parseFloat(v)) || 'Invalid price asset amount']"
				></v-text-field>
				{{ amount }} {{ getAssets[amountAsset].name }} for {{ priceAssetAmount }} {{ getAssets[priceAsset].name }}
				<v-switch
					:disabled="!checkStatus"
					v-model="all"
					label="All or none (PRO)"
				></v-switch>
				<v-switch
					:disabled="!checkStatus"
					v-model="passwordProtected"
					label="Password protected (PRO)"
				></v-switch>
				<v-text-field
					v-if="passwordProtected"
					append-icon="mdi-autorenew"
					v-model="password"
					label="Password"
					@click:append="generate"
				></v-text-field>
				<v-btn v-if="!checkStatus" text color="primary" @click="showUpgradeDialog">Upgrade to PRO</v-btn>
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn text color="primary" @click="create">Create</v-btn>
				<v-btn text color="primary" @click="dialog = false">Close</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex';
	import utils from '../utils'

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
				if (!value)
					this.passwordProtected = false;
					this.all = false;
			},
			// getAssetsArray(value) {
			// 	if (!_.isEqual(this.assetsArray, value))
			// 		this.assetsArray = value;
			// }
		},
		computed: {
			...mapGetters([
				'getCurrentPair',
				'getAssets',
				'getAssetsArray',
				'checkStatus',
			]),
		},
		methods: {
			...mapActions([
				'makeSell',
				'makeBuy',
				'showUpgradeDialog',
			]),
			generate() {
				return utils.randomValue(16)
			},
			itemText(item) {
				return item.id === 'WAVES' ? 'WAVES' : item.name + ': ' + item.id;
			},
			async create() {
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
				}
				try {
					this.orderType === 'sell' ? await this.makeSell(params) : await this.makeBuy(params);
				} catch (e) {
					this.$notify({ type: 'error', text: e.message });
				}
			},
		},
	}
</script>