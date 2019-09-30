<template>
	<v-data-table
	:headers="headers"
	:items="items"
	:items-per-page="items.length"
	height="100%"
	hide-default-footer
	>
</v-data-table>
</template>

<script>
	export default {
		props: {
      items: {
        type: Array,
        default: () => [],
      },
    },
		data: () => ({
      headers: [
        { text: 'Owner', value: 'owner' },
        { text: 'Price', value: 'price' },
        { text: 'Amount', value: 'amount' },
        { text: 'Total', value: 'total' },
        { text: 'Actions', value: 'action' },
      ],
		}),
		methods: {
		},
	}
</script>