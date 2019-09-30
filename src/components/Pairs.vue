<template>
	<v-card class="d-flex flex-column flex-grow-1" style="height: 100%" outlined>
		<v-card-title>
			<span class="title">Available pairs</span>
      <v-spacer></v-spacer>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn small text v-on="on" color="primary">
            Add asset
            <template v-slot:loader>Wait...</template>
          </v-btn>
        </template>
        <span>Add new asset</span>
      </v-tooltip>
		</v-card-title>
		<v-card-text class="d-flex" style="overflow: auto">
			<v-data-table
			class="d-flex flex-column"
			style="width: 100%"
			:headers="headers"
			:items="pairs"
			:search="search"
			:custom-filter="dataFilter"
			:items-per-page="pairs.length"
			hide-default-footer
			height="100%"
			>
			<template v-slot:top>
				<v-text-field v-model="search" label="Search" prepend-inner-icon="mdi-magnify" clearable>
					<template v-slot:append>
						<v-tooltip bottom>
							<template v-slot:activator="{ on }">
								<v-icon v-on="on">mdi-help-circle-outline</v-icon>
							</template>
							I'm a tooltip
						</v-tooltip>
					</template>
				</v-text-field>
			</template>
		</v-data-table>
	</v-card-text>
</v-card>
</template>

<script>
	export default {
		data: () => ({
			search: '',
			headers: [
				{ text: 'Pair', value: 'pair' },
			],
			pairs: [
				{ pair: 'WAVES/BTC', assets: 'test' },
				{ pair: 'WAVES/USD', assets: 'test1' },
				{ pair: 'VST/WAVES', assets: 'test1' },
				{ pair: 'VST/USD', assets: 'test2' },
				{ pair: 'WAVES/ETH', assets: 'test2' },
				{ pair: 'ETH/BTC', assets: 'test' },
				{ pair: 'ETH/USD', assets: 'test' },
				{ pair: 'ETH/USD', assets: 'test' },
				{ pair: 'ETH/USD', assets: 'test' },
				{ pair: 'ETH/USD', assets: 'test' },
				{ pair: 'ETH/USD', assets: 'test' },
				{ pair: 'ETH/USD', assets: 'test' },
				{ pair: 'ETH/USD', assets: 'test' },
				{ pair: 'ETH/USD', assets: 'test' },
				{ pair: 'ETH/USD', assets: 'test' },
			]
		}),
		methods: {
			dataFilter: function (value, search, item) {
				return value != null &&
					search != null &&
					typeof value === 'string' &&
					(item.pair.indexOf(search) !== -1 || item.assets.indexOf(search) !== -1)
			},
		},
	}
</script>