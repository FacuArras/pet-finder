import { Router } from "@vaadin/router";
import { state } from "../../state";
import Dropzone from "dropzone";
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { mapboxgl } from "../../../be-dist/lib/mapbox";

class PublishPetPage extends HTMLElement {
    connectedCallback() {
        /* Obtengo el objeto de localStorage. */
        const petFinderLocalStorage = localStorage.getItem("pet-finder");

        /* Si no existe el objeto en localStorage no le permito entrar a esta página y lo mando de nuevo a /home. */
        if (petFinderLocalStorage) {
            this.render();
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

    addListeners() {
        /* Incializo Dropzone para poder cambiar la foto de la mascota. */
        let pictureFile;
        const petFormEl = this.querySelector("#publish-pet-form");

        const myDropzone = new Dropzone(".profile-picture-container", {
            url: "/falsa",
            autoProcessQueue: false,
            maxThumbnailFilesize: 2,
            maxFiles: 1,
            thumbnailWidth: 260,
            thumbnailHeight: 260
        });

        myDropzone.on("thumbnail", function (file) {
            pictureFile = file;
        });

        /* Inicializo Mapbox para poder obtener la ubicación de la mascota. */
        let lostPet = {
            placeName: "",
            placeLng: 0,
            placeLat: 0
        };

        const map = new mapboxgl.Map({
            container: 'mapbox',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [-64.1816829, -38.4068799],
            zoom: 2,
        });

        /* Inicializo el buscador del mapa. */
        const geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl,
            countries: "Ar",
            marker: false
        });

        /* Al encontrar resultado crea un nuevo marcador para obtener la información precisa, además de obtener el nombre de la
                 ubicación puesta en el buscador y guardar todo en el objeto "lostPet". */
        geocoder.on('result', (e) => {
            lostPet.placeName = e.result.text;
            lostPet.placeLng = e.result.center[0];
            lostPet.placeLat = e.result.center[1];

            const marker = new mapboxgl.Marker({
                draggable: true
            }).setLngLat([e.result.center[0], e.result.center[1]]).addTo(map);

            function onDragEnd() {
                const lngLat = marker.getLngLat();
                lostPet.placeLng = lngLat.lng;
                lostPet.placeLat = lngLat.lat;
                console.log(lngLat);
            };

            marker.on('dragend', onDragEnd);
        });

        const geocoderEl = this.querySelector("#geocoder");
        geocoderEl!.appendChild(geocoder.onAdd(map));

        /* Escucho el form para poder crear una nueva mascota. */
        petFormEl!.addEventListener("submit", e => {
            e.preventDefault();
            const petFinderLocalStorage = localStorage.getItem("pet-finder");
            const target = e.target as any;
            const petName = target.petName.value;
            const petPicture = pictureFile.dataURL;
            const petDescription = target.petDescription.value;

            state.createPet(JSON.parse(petFinderLocalStorage!).token, petName, petPicture, lostPet.placeLat, lostPet.placeLng, petDescription, "lost", lostPet.placeName);
        });
    };

    render() {
        this.innerHTML = `
            <header-comp></header-comp>
            <main class="main">
                <h1 class="title">Reportar mascota perdida</h1>
                <h3 class="subtitle">Ingresá la siguiente información para realizar el reporte de la mascota</h3>
                <form id="publish-pet-form" class="form">
                    <label class="label" for="petName">Nombre</label>
                    <input type="text" maxlength="8" class="input" name="petName" id="petName">
                    
                    <p class="label">Foto de tu mascota</p>
                    <div class="profile-picture-container"></div>
                    
                    <p class="label">Marcá en el mapa el útlimo lugar en donde la viste (Tenés que poner la ubicación en el buscador y después mover el marcador a un lugar más preciso)</p>
                    <div id="geocoder" class="geocoder"></div>
                    <div id="mapbox"></div>

                    <label class="label" for="petDescription">Información útil para encontrarla</label>
                    <textarea class="input" name="petDescription" id="petDescription" cols="30" rows="5"></textarea>

                    <button type="submit" id="petForm__submit-button" class="button button--green">Enviar información</button>
                    <button type="button" id="petForm__cancel-button" class="button button--black">Cancelar</button>
                </form>
            </main>

        `;

        this.addListeners();
    };
};

customElements.define("publish-pet-page", PublishPetPage);