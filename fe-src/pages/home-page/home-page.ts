const homeImage = require("url:../../img/home-image.png");

class HomePage extends HTMLElement {
    connectedCallback() {
        this.render();
    };

    render() {
        this.innerHTML = `
            <header-comp></header-comp>
            <main class="main">
                <img class="main__image" src="${homeImage}">
                <h1 class="main__home-title">Pet Finder App</h1>
                <h2 class="main__home-subtitle">Encontrá y reportá mascotas perdidas cerca de tu ubicación</h2>
                <a class="button-link" href="/lost-pets">
                    <button class="button button--blue main__location-button">Dar mi ubicación actual</button>
                </a>
                <a class="button-link" href="/published-pets">
                    <button class="button button--green main__info-button">Reportar mascota perdida</button>
                </a>
            </main>
        `;
    };
};

customElements.define("home-page", HomePage);