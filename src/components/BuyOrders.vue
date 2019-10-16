<template>
	<v-card class="d-flex flex-column flex-grow-1" style="height: 100%" outlined>
		<v-card-title>
			<span class="title">Buy orders</span>
			<v-spacer />
			<MakeOrderForm orderType="buy" />
		</v-card-title>
		<v-card-text class="d-flex flex-column" style="overflow: auto">
			<OrdersTable :items="items" />
		</v-card-text>
	</v-card>
</template>

<script>
	import OrdersTable from './OrdersTable'
	import MakeOrderForm from './MakeOrderForm'

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
		},
		methods: {
		},
	}
</script>