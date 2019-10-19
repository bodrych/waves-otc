<template>
  <v-app>
    <notifications position="bottom right" :duration="10000" width="25%">
      <template slot="body" slot-scope="props">
        <v-alert :type="props.item.type" class="mr-2" dismissible @input="props.close">
          {{ props.item.text }}
        </v-alert>
      </template>
    </notifications>
    <v-app-bar app short>
      <v-toolbar-title>
        <span class="headline">OTC</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- <v-btn href="https://github.com/bodrych/" target="_blank" icon><v-icon>mdi-github-circle</v-icon></v-btn> -->
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

<style>
  html {
    min-width: 1280px;
    height: 100vh;
    overflow-x: auto !important;
  }
</style>