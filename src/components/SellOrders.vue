<template>
	<v-card class="d-flex flex-column flex-grow-1" style="height: 100%">
		<v-card-title>
			<span class="title">Sell orders</span>
			<v-spacer />
			<MakeOrderForm order-type="sell" :current-pair="getCurrentPair" />
		</v-card-title>
		<v-card-text class="d-flex flex-column" style="overflow: auto">
			<OrdersTable :items="items" />
		</v-card-text>
	</v-card>
</template>

<script>
	import OrdersTable from './OrdersTable'
	import MakeOrderForm from './MakeOrderForm'
	import { mapGetters } from 'vuex'

	export default {
		props: {
			items: {
				type: Array,
				default: () => [],
			},
		},
		components: {
			OrdersTable,
			MakeOrderForm,
		},
		data: () => ({
		}),
		computed: {
			...mapGetters(['getCurrentPair'])
		},
		methods: {
		},
	}
</script>