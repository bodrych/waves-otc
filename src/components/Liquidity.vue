<template>
	<v-card class="d-flex flex-column flex-grow-1" style="height: 100%">
		<v-card-title>
			<span class="title">Liquidity</span>
		</v-card-title>
		<v-card-text class="d-flex flex-column" style="overflow: auto">
			<v-data-table
				class="d-flex flex-column"
				style="width: 100%"
				:headers="headers"
				:items="getLiquidityArray"
				:items-per-page="-1"
				hide-default-footer
				height="100%"
				:mobile-breakpoint="0"
			>
                <template v-slot:item.sell="{ item }">
                    <span>{{ item.sell === 0 ? '—' : item.sell }}</span>
                </template>
                <template v-slot:item.buy="{ item }">
                    <span>{{ item.buy === 0 ? '—' : item.buy }}</span>
                </template>
            </v-data-table>
		</v-card-text>
	</v-card>
</template>

<script>
	import { mapGetters } from 'vuex';

	export default {
		data() {
			return {
				headers: [
					{ text: 'Asset', value: 'name' },
					{ text: 'Sell', value: 'sell', align: 'end' },
					{ text: 'Buy', value: 'buy', align: 'end' },
				],
			}
		},
        components: {
        },
		computed: {
			...mapGetters([
				'getLiquidityArray',
			]),
		},
		watch: {
		},
		mounted() {
		},
		methods: {
		},
	}
</script>