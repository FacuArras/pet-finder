import { state } from "../../state";
import { Router } from "@vaadin/router";
const editIcon = require("url:../../img/editIcon.svg");
const emptyImg = require("url:../../img/empty.png");

class PublishedPetsPage extends HTMLElement {
    async connectedCallback() {
        /* Obtengo el objeto de localStorage. */
        const petFinderLocalStorage = localStorage.getItem("pet-finder");

        /* Si no existe el objeto en localStorage no le permito entrar a esta página y lo mando de nuevo a /home. */
        if (petFinderLocalStorage) {
            /* Si existe, obtengo el token guardado y lo ejecuto en la función "getAllPetsFromUser" para obtener las mascotas reportadas del usuario. */
            try {
                const petsFromUser = await state.getAllPetsFromUser(JSON.parse(petFinderLocalStorage!).token);

                /* Si el usuario tiene por lo menos una mascota guardada se ejecutan las cards. */
                if (petsFromUser.length > 0) {
                    this.render();

                    for (const pet of petsFromUser) {
                        this.addContentToTemplates(pet);
                    };

                    /* Si no tiene ninguna mascota guardada se le da la opción de crear un nuevo reporte. */
                } else {
                    this.render();

                    const subtitleEl = document.createElement("h3");
                    subtitleEl.classList.add("subtitle");
                    subtitleEl.textContent = "Aún no reportaste ninguna mascota";

                    const imgEl = document.createElement("img");
                    imgEl.classList.add("main__image--lost-pets");
                    imgEl.src = emptyImg;

                    const reportEl = document.createElement("a");
                    const buttonEl = document.createElement("button");
                    buttonEl.classList.add("button", "button--blue", "main__button--published-pets");
                    buttonEl.textContent = "Publicar mascota";
                    reportEl.href = "/publish-pets";

                    reportEl.appendChild(buttonEl);
                    this.querySelector(".main")!.appendChild(subtitleEl);
                    this.querySelector(".main")!.appendChild(imgEl);
                    this.querySelector(".main")!.appendChild(reportEl);
                };
            } catch (e) {
                console.log(e);
            };
        } else {
            this.innerHTML = `
                <header-comp></header-comp>
                <main class="main">
                    <h1 class="title main__title--login">Para entrar en esta página necesitas inciar sesión.</h1>
                </main>
            `;

            setTimeout(() => {
                Router.go("/home");
            }, 3000);
        };
    };

    /* Agrego toda la información a los elementos correspondientes. */
    addContentToTemplates(params = {} as any) {
        const templateEl = this.querySelector("#card-template") as any;
        const cardsContainerEl = this.querySelector(".cards-container") as any;

        templateEl.content.querySelector(".card__image").src = params.pet_picture_URL;
        templateEl.content.querySelector(".card__info__name").textContent = params.full_name;
        templateEl.content.querySelector(".card__info__last-seen").textContent = params.last_seen;
        templateEl.content.querySelector(".card__info__edit-link").href = "update-pets?id=" + params.id;

        const contentClone = document.importNode(templateEl.content, true);
        cardsContainerEl.appendChild(contentClone);
    };

    render() {
        this.innerHTML = `
            <header-comp></header-comp>
            <main class="main">
                <h1 class="title main__title--lost-pets">Mis mascotas perdidas</h1>
                
                <div class="cards-container"></div>
                
                <template id="card-template">
                    <div class="card">
                        <div class="card__image-container">
                            <img class="card__image" src="" alt="Lost pet image">
                        </div>
                            
                        <div class="card__info">
                            <div class="card__info__names-container">
                                <h2 class="card__info__name">Fiu fiu</h2>
                                <p class="card__info__last-seen">Av. Capdevilla</p>
                            </div>    
                                
                            <a class="card__info__edit-link">
                                <button class="card__info__edit-button">
                                    Editar
                                    <img src="${editIcon}">
                                </button>
                            </a>
                        </div>
                    </div>
                </template>
            </main>
        `;
    };
};

customElements.define("published-pets-page", PublishedPetsPage);