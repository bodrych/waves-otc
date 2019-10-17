<template>
  <v-app>
    <notifications position="bottom right" :duration="10000" width="25%">
      <template slot="body" slot-scope="props">
        <v-alert :type="props.item.type" class="mr-2" dismissible @input="props.close">
          {{ props.item.text }}
        </v-alert>
      </template>
    </notifications>
    <v-app-bar app short dark color="primary">
      <v-toolbar-title class="headline text-uppercase">
        <span>OTC</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn href="https://github.com/bodrych/waves-otc" target="_blank" icon><v-icon>mdi-github-circle</v-icon></v-btn>
    </v-app-bar>

    <v-content id="content">
      <RouterView/>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
  #content {
    height: calc(100vh - 56px);
  }
  html {
    min-width: 1280px;
    overflow-x: auto !important;
  }
</style>