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
		<v-btn text color="primary" @click="buyOTCuFromDApp">Buy</v-btn>
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
			}
		},
		watch: {
			targetAmount(value) {
				this.amount = value;
			},
		},
		computed: {
			...mapGetters(['getLogin', 'getDAppBalance']),
		},
		methods: {
			...mapActions(['buyUtilityTokenDApp']),
			async buyOTCuFromDApp() {
				try {
					await this.buyUtilityTokenDApp(this.amount * 10 ** 8);
				} catch(e) {
					this.$notify({ type: 'error', text: e.message || 'Error' });
				}
			},
		},
	}
</script>