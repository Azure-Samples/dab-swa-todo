<template>
  <footer class="info">
    <label v-if="!userDetails" id="login">[<a href=".auth/login/github">login</a>]</label>
    <label v-if="userDetails" id="logoff">[<a href=".auth/logout">logoff {{ userDetails }}</a>]</label>
    <p>Double-click to edit a todo, drag-and-drop a todo to change position</p>
    <div class="bottom">
      <p>Original <a href="https://github.com/vuejs/vuejs.org/tree/master/src/v2/examples/vue-20-todomvc">Vue.JS Sample</a> by <a href="http://evanyou.me">Evan You</a>,
      Part of <a href="http://todomvc.com">TodoMVC project</a></p>
			<p>Adapted for Vue3 + Azure Static Web Apps + Data API Builder + Azure SQL by <a href="http://davidemauri.it">Davide Mauri</a></p>                
      <p>Version: {{ version }} - {{ gitHash }}</p>
    </div>
  </footer>
</template>


<script lang="js">
export default {
  data() {
    return {
      gitHash: import.meta.env.VITE_APP_GIT_HASH,
      version: import.meta.env.VITE_APP_VERSION
    }
  },

  props: ['userDetails']
}
</script>