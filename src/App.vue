<template>
  <v-app>
    <v-app-bar app short dark color="primary">
      <v-toolbar-title class="headline text-uppercase">
        <span>OTC</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn href="https://github.com/" target="_blank" icon><v-icon>mdi-github-circle</v-icon></v-btn>
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
  html { overflow-y: auto !important }
</style>