import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.css";
import VueCodeMirror from "vue-codemirror";
import App from "./App";
import store from "./store";
import "@mdi/font/css/materialdesignicons.css";

Vue.use(Vuetify, {
  options: {
    customProperties: true
  },
  iconfont: 'mdi'
});
Vue.use(VueCodeMirror);

if (!process.env.IS_WEB) Vue.use(require("vue-electron"));
Vue.config.productionTip = false;

/* eslint-disable no-new */
export default new Vue({
  components: { App },
  store,
  template: "<App/>"
}).$mount("#app");
