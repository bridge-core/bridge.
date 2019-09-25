import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.css";
import VueCodeMirror from "vue-codemirror";
import App from "./App";
import store from "./store";
import "@mdi/font/css/materialdesignicons.css";

Vue.use(Vuetify);
Vue.use(VueCodeMirror);

if (!process.env.IS_WEB) Vue.use(require("vue-electron"));
Vue.config.productionTip = false;

export const vuetify = new Vuetify({
    theme: {
        options: {
            customProperties: true
        },
        themes: {
            dark: {
                primary: "#4caf50",
                secondary: "#1778D2",

                toolbar: "#000000",
                footer: "#212121"
            },
            light: {
                primary: "#1778D2",
                secondary: "#1778D2",

                toolbar: "#e0e0e0",
                footer: "#f5f5f5"
            }
        }
    }
});

export default new Vue({
    components: { App },
    vuetify,
    store,
    template: "<App/>"
}).$mount("#app");