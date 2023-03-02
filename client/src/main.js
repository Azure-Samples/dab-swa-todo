import { createApp } from 'vue'
import App from './App.vue'
import VueProgressBar from "@aacassandra/vue3-progressbar";

const options = {
    color: "#ffcf2c",
    failedColor: "#874b4b",
    thickness: "5px",
    transition: {
      speed: "0.1s",
      opacity: "0.6s",
      termination: 100,
    },
    autoRevert: true,    
    inverse: false,
  };

createApp(App)
    .use(VueProgressBar, options)
    .mount('#app')

