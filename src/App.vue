<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>VST OTC</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-content>
      <RouterView/>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: 'App',
};
</script>
