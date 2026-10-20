import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "home", component: HomeView },
    {
      path: "/pais:code",
      name: "country",
      component: ()=> import("@/views/CountryView.vue"),
      props: true,
    },
  ],
});

export default router;
