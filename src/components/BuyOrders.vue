<template>
	<v-card class="d-flex flex-column flex-grow-1" outlined>
		<v-card-title>
			<span class="title">Buy orders</span>
			<v-spacer></v-spacer>
			<v-tooltip bottom>
				<template v-slot:activator="{ on }">
					<v-btn small text v-on="on" color="primary">
						New order
						<template v-slot:loader>Wait...</template>
					</v-btn>
				</template>
				<span>Create new buy order</span>
			</v-tooltip>
		</v-card-title>
		<v-card-text>
			<OrdersTable :items="items" />
		</v-card-text>
	</v-card>
</template>

<script>
	import OrdersTable from "./OrdersTable"

	export default {
		components: {
			OrdersTable
		},
		data: () => ({
			items: [
				{ owner: 'Test buy order' }
			]
		}),
		methods: {
		},
	}
</script>