import { Router } from "@vaadin/router";

window.addEventListener("DOMContentLoaded", () => {
    const router = new Router(document.querySelector(".root"));

    router.setRoutes([
        { path: "/", redirect: "/home" },
        { path: "/home", component: "home-page" },
        { path: "/auth", component: "auth-page" },
        { path: "/register", component: "register-page" },
        { path: "/profile", component: "profile-page" },
        { path: "/lost-pets", component: "lost-pets-page" },
        { path: "/publish-pets", component: "publish-pet-page" },
        { path: "/published-pets", component: "published-pets-page" },
        { path: "/update-pets", component: "update-pet-page" },
    ]);
});