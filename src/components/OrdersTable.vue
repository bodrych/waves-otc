<template>
	<v-container>
		<v-data-table
		:headers="headers"
		:items="items"
		:items-per-page="-1"
		height="100%"
		hide-default-footer
		sort-by="price"
		:sort-desc="true"
		>
			<template v-slot:item.action="{ item }">
				<v-btn @click.stop="showOrderTakeDialog({ order: item })" x-small icon><v-icon small>mdi-cart-outline</v-icon></v-btn>
				<v-btn @click.prevent="doCancelOrder(item)" x-small icon :disabled="(item.owner !== getAddress) || (item.amount < 0.0000001)"><v-icon small>mdi-logout</v-icon></v-btn>
			</template>
			<template v-slot:item.priceFmt="{ item }">
				{{ item.priceFmt }} {{ item.priceAssetName }}
			</template>
			<template v-slot:item.amountFmt="{ item }">
				{{ item.amountFmt }} {{ item.amountAssetName }}
			</template>
			<template v-slot:item.priceAssetAmountFmt="{ item }">
				{{ item.priceAssetAmountFmt }} {{ item.priceAssetName }}
			</template>
			<template v-slot:item.info="{ item }">
				<v-tooltip bottom v-if="item.all">
					<template v-slot:activator="{ on }">
						<v-icon v-on="on" small>mdi-equal</v-icon>
					</template>
					<span>Take all or nothing</span>
				</v-tooltip>
				<v-tooltip bottom v-if="item.password !== ''">
					<template v-slot:activator="{ on }">
						<v-icon v-on="on" small>mdi-lock-outline</v-icon>
					</template>
					<span>Password protected</span>
				</v-tooltip>
			</template>
		</v-data-table>
		<TakeOrderForm/>
	</v-container>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex';
	import TakeOrderForm from './TakeOrderForm'

	export default {
		props: {
			items: {
				type: Array,
				default: () => [],
			},
		},
		data: () => ({
			amount: 0,
			password: '',
			headers: [
				{ text: '', value: 'info', sortable: false, align: 'left' },
				{ text: 'Price', value: 'priceFmt', align: 'right' },
				{ text: 'Amount', value: 'amountFmt', align: 'right' },
				{ text: 'Total', value: 'priceAssetAmountFmt', align: 'right' },
				{ text: 'Actions', value: 'action', sortable: false, align: 'center' },
			],
		}),
		components: {
			TakeOrderForm,
		},
		computed: {
			...mapGetters(['getCurrentPair', 'getAddress', 'checkStatus', 'orderTakeDialogDisplay']),
		},
		methods: {
			...mapActions(['takeSell, takeBuy', 'cancelOrder', 'showOrderTakeDialog', 'closeOrderTakeDialog']),
			async doCancelOrder(order) {
				try {
					await this.cancelOrder({ id: order.id, type: order.type });
				} catch (e) {
					this.$notify({ type: 'error', text: e.message || 'Error' });
				}
			},
		},
	}
</script>