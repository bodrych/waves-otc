<template>
	<v-alert type="info" :icon="false" outlined>
		You don't have enough OTCu. You can get it from dApp.
		<v-text-field
			light
			v-model="amount"
			label="Amount"
			suffix="OTCu"
			:rules="[v => !!v || 'Item is required', v => v > 0 && v <= +(getDAppBalance / 10 ** 8).toFixed(8) && !isNaN(parseFloat(v)) || 'Invalid amount']"
		></v-text-field>
		<v-text-field
			light
			v-model="amount"
			label="You will pay"
			suffix="WAVES"
			readonly
		></v-text-field>
		<v-btn text color="primary" @click="buyOTCuFromDApp" :loading="buyLoading">Buy</v-btn>
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
				buyLoading: false,
			}
		},
		watch: {
			targetAmount(value) {
				this.amount = value;
			},
		},
		computed: {
			...mapGetters([
				'getLogin',
				'getDAppBalance'
			]),
		},
		methods: {
			...mapActions([
				'buyUtilityTokenDApp'
			]),
			async buyOTCuFromDApp() {
				try {
					this.buyLoading = true;
					await this.buyUtilityTokenDApp({ amount: this.amount * 1e8, wait: true });
					this.buyLoading = false;
				} catch(e) {
					this.buyLoading = false;
					this.$notify({ type: 'error', text: e.message || 'Error' });
				}
			},
		},
	}
</script>