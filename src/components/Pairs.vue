<template>
    <v-card class="d-flex flex-column flex-grow-1" style="height: 100%" outlined>
        <v-card-title>
            <span class="title">Pairs</span>
            <v-spacer />
            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <v-btn text v-on="on" color="primary" @click.stop="showDialog">Add asset</v-btn>
                </template>
                <span>Add new asset to the trade whitelist for 100 OTCu</span>
            </v-tooltip>
            <v-dialog v-model="dialog" max-width="30%" :transition="false">
                <v-card>
                    <v-card-title><span class="title">Add new asset</span></v-card-title>
                    <v-card-text>
                        Price: 100 OTCu
                        <v-text-field
                            v-model="asset"
                            label="Asset ID"
                            :rules="[v => !!v || 'Item is required', v => !(v in getAssets) || 'Asset in whitelist already']"
                        ></v-text-field>
                        <v-alert v-if="uTokenRefill(requiredAmount).showAlert" type="info" :icon="false" outlined>
                            The price is 100 OTCu or WAVES
                        </v-alert>
                        <buyDEX v-if="uTokenRefill(requiredAmount).showBuyDex" :targetAmount="requiredAmount - balance" />
                        <buyDApp v-if="uTokenRefill(requiredAmount).showBuyDApp" :targetAmount="requiredAmount - balance" />
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer />
                        <v-btn text color="primary" @click="doAddAsset()" :disabled="!getLogin" :loading="addAssetLoading">Add asset</v-btn>
                        <v-btn text color="primary" @click="dialog = false">Close</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-card-title>
        <v-card-text class="d-flex flex-column" style="overflow: auto">
            <v-data-table
            @click:row="selectPair"
            class="d-flex flex-column"
            style="width: 100%"
            :headers="headers"
            :items="getPairs"
            :search="search"
            :custom-filter="dataFilter"
            :items-per-page="-1"
            hide-default-footer
            height="100%"
            mobile-breakpoint="0"
            >
            <template v-slot:top>
                <v-text-field v-model="search" label="Search" prepend-inner-icon="mdi-magnify" clearable>
                    <!-- <template v-slot:append>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-icon v-on="on">mdi-help-circle-outline</v-icon>
                            </template>
                            I'm a tooltip
                        </v-tooltip>
                    </template> -->
                </v-text-field>
            </template>
            <template v-slot:item.amountAssetName="{ item }">
                <span>{{ item.amountAssetName + ' / ' + item.priceAssetName }}</span>
            </template>
        </v-data-table>
    </v-card-text>
</v-card>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex';
    import BuyDApp from '@/components/BuyDApp';
    import BuyDEX from '@/components/BuyDEX';
    import config from '@/config';

    export default {
        data: () => ({
            requiredAmount: 100,
            asset: '',
            dialog: false,
            search: '',
            headers: [
                { text: 'Pair', value: 'amountAssetName' },
            ],
            addAssetLoading: false,
        }),
        components: {
            BuyDApp,
            BuyDEX,
        },
        computed: {
            ...mapGetters([
                'getPairs',
                'getCurrentPair',
                'getAssets',
                'getLogin',
                'getBalance',
                'uTokenRefill'
            ]),
			balance() {
				return this.getLogin && this.getBalance && this.getBalance[config.OTCu] ? +(this.getBalance[config.OTCu] / 10 ** 8).toFixed(8) : 0;
			},
        },
        methods: {
            ...mapActions([
                'fetchDexOrderbook',
                'fetchDAppBalance',
                'addAsset',
                'setCurrentPair',
                'fetchAvailableAssetsDetails',
            ]),
            showDialog() {
                this.dialog = true;
                this.fetchDexOrderbook();
                this.fetchDAppBalance();
            },
            async doAddAsset() {
                try {
                    this.addAssetLoading = true;
                    await this.addAsset({
                        asset: this.asset,
                        inWaves: this.uTokenRefill(this.requiredAmount).inWaves,
                        wait: true,
                    });
					await this.fetchAvailableAssetsDetails();
					this.addAssetLoading = false;
                } catch (e) {
					this.addAssetLoading = false;
                    this.$notify({ type: 'error', text: e.message || 'Error' });
                }
            },
            selectPair: function (item) {
                this.setCurrentPair({
                    amountAsset: item.amountAsset,
                    amountAssetName: item.amountAssetName,
                    priceAsset: item.priceAsset,
                    priceAssetName: item.priceAssetName,
                })
            },
            dataFilter: function (value, search, item) {
                return value != null &&
                search != null &&
                typeof value === 'string' &&
                (item.amountAssetName.toLowerCase().indexOf(search.toLowerCase()) !== -1
                || item.priceAssetName.toLowerCase().indexOf(search.toLowerCase()) !== -1
                || item.amountAsset.toLowerCase().indexOf(search.toLowerCase()) !== -1
                || item.priceAsset.toLowerCase().indexOf(search.toLowerCase()) !== -1)
            },
        },
    }
</script>