<template>
	<v-card class="d-flex flex-column flex-grow-1" style="height: 100%" outlined>
		<v-card-title>
			<span class="title">Account</span>
			<v-spacer></v-spacer>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn small text v-on="on" color="primary">
            Login
            <template v-slot:loader>Wait...</template>
          </v-btn>
        </template>
        <span>Login with Waves Keeper</span>
      </v-tooltip>
		</v-card-title>
		<v-card-text>
			Info about address and pro-functions
		</v-card-text>
	</v-card>
</template>

<script>
	export default {
		data: () => ({
		}),
		methods: {
		},
	}
</script>