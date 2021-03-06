<template>
	<v-card class="d-flex flex-column flex-grow-1" style="height: 100%">
		<v-card-title>
			<span class="title">Info</span>
			<v-spacer />
			<v-tooltip left v-if="!getStatus.unlimited">
				<template v-slot:activator="{ on }">
				<v-btn v-on="on" v-if="!getStatus.unlimited" text @click="showUpgradeDialog">
					Upgrade to PRO
				</v-btn>
				</template>
				<span>Get access to take-all-or-nothing and password protected orders</span>
			</v-tooltip>
		</v-card-title>
		<v-card-text class="d-flex flex-column" style="overflow: auto; height: 100%">
			<template v-if="getLogin">
				<p>{{ getAddress }}</p>
				<p>Current status: {{ status }}</p>
			</template>
			<p>Trading fee: 0.005 WAVES</p>
			<v-switch class="mt-0" v-model="darkTheme" label="Dark mode"></v-switch>
			<v-spacer/>
			<v-text-field 
				v-model="getApiBase"
				label="Data provider"
				hint="You can change it in Waves Keeper settings"
				persistent-hint
				disabled
				class="flex-grow-0"
			>
			</v-text-field>
		</v-card-text>
		<v-dialog v-model="dialogDisplay" max-width="30%" :transition="false">
			<v-card>
				<v-card-title><span class="title">Buy PRO status</span></v-card-title>
				<v-card-text>
					<v-radio-group v-model="targetStatus">
						<v-radio
							label="1 month - 10 OTCu"
							:value="false"
						></v-radio>
						<v-radio
							label="Unlimited - 50 OTCu"
							:value="true"
						></v-radio>
					</v-radio-group>
					<v-alert v-if="uTokenRefill(requiredAmount).showAlert" type="info" :icon="false" outlined>
						The price is {{ requiredAmount }} OTCu or WAVES
					</v-alert>
					<buyDEX v-if="uTokenRefill(requiredAmount).showBuyDex" :targetAmount="requiredAmount - balance" />
					<buyDApp v-if="uTokenRefill(requiredAmount).showBuyDApp" :targetAmount="requiredAmount - balance" />
				</v-card-text>
				<v-card-actions>
					<v-spacer />
					<v-btn text @click="doBuyPro(targetStatus)" :disabled="!getLogin" :loading="buyProLoading">Buy PRO</v-btn>
					<v-btn text @click="closeUpgradeDialog">Close</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</v-card>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex';
	import config from '@/config';
    import BuyDApp from '@/components/BuyDApp';
	import BuyDEX from '@/components/BuyDEX';

	export default {
		data() {
			return {
				requiredAmount: 10,
				targetStatus: false,
				amount: 10,
				address: '',
				dialog: false,
				dexDialog: false,
				price: 1e8,
				dexData: {},
				dexAmount: 1,
				dexTargetAmount: 1,
				dexPrice: 1,
				dexPriceAssetAmount: 1,
				dexMaxBuyAmount: 1,
				buyProLoading: false,
			}
		},
        components: {
            BuyDApp,
            BuyDEX,
        },
		computed: {
			...mapGetters([
				'getAddress',
				'getLogin',
				'getStatus',
				'getDexStatus',
				'getDAppBalance',
				'uTokenRefill',
				'getBalance',
				'upgradeDialogDisplay',
				'getApiBase',
				'getDarkTheme',
			]),
			status() {
				if (this.getStatus.unlimited) {
					return 'PRO (unlimited)'
				} else if (this.getStatus.deadline > (new Date()).getTime()) {
					return 'PRO (expires ' + (new Date(this.getStatus.deadline)).toLocaleDateString() + ')'
				} else {
					return 'FREE'
				}
			},
			balance() {
				return this.getLogin && this.getBalance && this.getBalance[config.OTCu] ? +(this.getBalance[config.OTCu] / 1e8).toFixed(8) : 0;
			},
			dialogDisplay: {
				get() {
					return this.upgradeDialogDisplay;
				},
				set(value) {
					if (value === false) this.closeUpgradeDialog();
				}
			},
			darkTheme: {
				get() {
					return this.getDarkTheme;
				},
				set(value) {
					this.$vuetify.theme.dark = value;
					return this.setDarkTheme(value);
				},
			}
		},
		watch: {
			targetStatus(value) {
				this.requiredAmount = value ? 50 : 10;
			},
		},
		async mounted() {
		},
		methods: {
			...mapActions([
				'fetchAddressStatus',
				'buyPro',
				'buyUtilityTokenDApp',
				'checkKeeper',
				'fetchDexOrderbook',
				'fetchDAppBalance',
				'showUpgradeDialog',
				'closeUpgradeDialog',
				'fetchAddressStatus',
				'setDarkTheme',
			]),
			showDialog() {
				this.dialog = true;
                this.fetchDexOrderbook();
                this.fetchDAppBalance();
			},
			async doBuyPro(unlimited) {
				try {
					this.buyProLoading = true;
					await this.buyPro({ unlimited, wait: true });
					await this.fetchAddressStatus;
					this.buyProLoading = false;
				} catch(e) {
					this.buyProLoading = false;
					this.$notify({ type: 'error', text: e.message || 'Error' });
				}
			},
		},
	}
</script>