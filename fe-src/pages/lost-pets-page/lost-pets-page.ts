import { Router } from "@vaadin/router";
import { state } from "../../state";
const siren = require("url:../../img/siren.svg");
const closeMenuIcon = require("url:../../img/closeMenu.svg");
const emptyImg = require("url:../../img/empty.png");

class LostPetsPage extends HTMLElement {
    async connectedCallback() {
        try {
            /* Obtengo la posición actual del usuario y se las paso como parámentros a la función
                 "getPetsNearby" que devuelve todas las mascotas dentro de un radio de 5km. */
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            }) as any;

            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            const petsNearby = await state.getPetsNearby(userLat, userLng);

            this.render();

            /* Si hay al menos una mascota cerca se ejecutan las cards. */
            if (petsNearby.nbHits > 0) {
                for (const pets of petsNearby.hits) {
                    this.addContentToTemplates(pets);
                }
            } else {
                /* Si no hay mascotas cerca se ejecuta un texto comunicando sobre la situación. */
                const subtitleEl = document.createElement("h3");
                subtitleEl.classList.add("subtitle");
                subtitleEl.textContent = "No hay mascotas cerca de tu ubicación";

                const imgEl = document.createElement("img");
                imgEl.classList.add("main__image--lost-pets");
                imgEl.src = emptyImg;

                this.querySelector(".main")!.appendChild(subtitleEl);
                this.querySelector(".main")!.appendChild(imgEl);
            }
        } catch (error) {
            /* Si no se puede obtener la ubicación se le informa al usuario sobre la situación y se le da una posible solución. */
            console.error("Error al obtener la ubicación:", error);

            this.render();

            const subtitleEl = document.createElement("h3");
            subtitleEl.classList.add("subtitle");
            subtitleEl.textContent = "No se pudo obtener tu ubicación correctamente, podría deberse a que no aceptaste que la página obtenga tu ubicación";

            const imgEl = document.createElement("img");
            imgEl.classList.add("main__image--lost-pets");
            imgEl.src = emptyImg;

            this.querySelector(".main")!.appendChild(subtitleEl);
            this.querySelector(".main")!.appendChild(imgEl);
        }
    }

    /* Agrego toda la información de las mascotas a los elementos correspondientes */
    addContentToTemplates(params = {} as any) {
        const templateEl = this.querySelector("#card-template") as any;
        const cardsContainerEl = this.querySelector(".cards-container") as any;

        templateEl.content.querySelector(".card__image").src = params.pet_picture_URL;
        templateEl.content.querySelector(".card__info__name").textContent = params.full_name;
        templateEl.content.querySelector(".card__info__last-seen").textContent = params.last_seen;
        templateEl.content.querySelector(".card__info__report-button").id = "button " + params.objectID;
        templateEl.content.querySelector(".card").id = params.objectID;

        const contentClone = document.importNode(templateEl.content, true);
        cardsContainerEl.appendChild(contentClone);
    };

    addListeners() {
        const cardsContainerEl = this.querySelector(".cards-container") as any;
        const reportEl = this.querySelector(".report") as any;
        const reportCloseMenuEl = this.querySelector(".report__close-menu") as any;
        const reportFormEl = this.querySelector(".report__form") as any;
        let reportPetId = 0;

        /* Escucho cuando se le haga click al button de "reportar" y le agrego la información correspondiente. */
        cardsContainerEl.addEventListener("click", e => {
            if (e.target.classList.value === "card__info__report-button") {
                const petId = e.target.id.split(" ")[1];
                reportPetId = petId;
                const cards = cardsContainerEl.querySelectorAll(".card");

                for (const c of cards) {
                    if (petId == c.id) {
                        reportEl.querySelector(".report__title").textContent = "Reportar info de " + c.querySelector(".card__info__name").textContent;
                    };
                };

                reportEl!.style.display = "flex";
            };
        });

        reportCloseMenuEl.addEventListener("click", e => {
            reportEl!.style.display = "none";
        });

        reportFormEl.addEventListener("submit", e => {
            e.preventDefault();

            const target = e.target as any;
            const fullName = target.fullname.value;
            const phoneNumber = target.phoneNumber.value;
            const lastSeen = target.lastSeen.value;

            state.createReport(reportPetId, fullName, lastSeen, phoneNumber);
        });
    };

    render() {
        this.innerHTML = `
            <header-comp></header-comp>
            <main class="main">
                <h1 class="title main__title--lost-pets">Mascotas perdidas cerca</h1>
                
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
                                
                            <button class="card__info__report-button">
                                Reportar
                                <img src="${siren}">
                            </button>
                        </div>
                    </div>
                </template>

                <div class="report">
                    <img class="report__close-menu" src="${closeMenuIcon}" alt="closeMenu">
                    <h1 class="report__title"></h1>
                    <form class="report__form">
                        <label class="report__form__label" for="fullname">Nombre</label>
                        <input type="text" class="report__form__input" name="fullname" id="fullname" required>
                        
                        <label class="report__form__label" for="phoneNumber">Teléfono</label>
                        <input type="number" class="report__form__input" name="phoneNumber" id="phoneNumber">
                        
                        <label class="report__form__label" for="lastSeen">¿Dónde lo viste?</label>
                        <textarea class="report__form__textarea" name="lastSeen" id="lastSeen" cols="30" rows="5" required></textarea>
                        
                        <button class="button button--green report__form__button">Enviar información</button>
                    </form>
                </div>
            </main>
        `;

        this.addListeners();
    };
};

customElements.define("lost-pets-page", LostPetsPage);