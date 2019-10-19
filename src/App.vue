<template>
  <v-app>
    <notifications position="bottom right" :duration="10000" width="25%">
      <template slot="body" slot-scope="props">
        <v-alert :type="props.item.type" class="mr-2" dismissible @input="props.close">
          {{ props.item.text }}
        </v-alert>
      </template>
    </notifications>
    <v-app-bar app short floating>
      <!-- <v-img
        :src="require('@/assets/raccoon.svg')"
        contain
        width="32"
        height="32"
        style="filter: invert(0)"
      ></v-img> -->
      <span class="headline">OTC</span><span class="headline font-weight-thin">Market</span>
      <!-- <v-spacer></v-spacer> -->
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