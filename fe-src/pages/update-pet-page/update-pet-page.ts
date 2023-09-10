import { state } from "../../state";
import { Router } from "@vaadin/router";
import Dropzone from "dropzone";
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { mapboxgl } from "../../../be-dist/lib/mapbox";

class UpdatePetPage extends HTMLElement {
    async connectedCallback() {
        /* Obtengo el id de la mascota de la URL para pasarsela como parámentro a la función "getOnePet".  */
        const pet = await state.getOnePet(parseInt(window.location.href.split("?")[1].split("=")[1]));

        this.render();

        this.addListeners(pet);
    };

    /* Recibo la mascota encontrada para pasarle la información a los elementos correspondientes. */
    addListeners(dbPet) {
        const fullNameEl = this.querySelector("#petName") as any;
        const pictureEl = this.querySelector(".profile-picture-container") as any;
        const descriptionEl = this.querySelector("#petDescription") as any;
        const foundButtonEl = this.querySelector("#updatePetForm__found-button") as any;
        const deleteButtonEl = this.querySelector("#updatePetForm__delete-button") as any;

        fullNameEl.value = dbPet.full_name;
        pictureEl.style.backgroundImage = "url('" + dbPet.pet_picture_URL + "')";
        descriptionEl.textContent = dbPet.description;

        /* Incializo Dropzone para poder cambiar la foto de la mascota. */
        let pictureFile;
        const updatePetFormEl = this.querySelector("#updatePetForm");

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

        /* Inicializo Mapbox para poder cambiar la ubicación de la mascota si así se desea. */
        let lostPet = {
            placeName: dbPet.last_seen,
            placeLng: dbPet.last_location_lng,
            placeLat: dbPet.last_location_lat
        };

        const map = new mapboxgl.Map({
            container: 'mapbox', // container ID
            style: 'mapbox://styles/mapbox/streets-v12', // style URL
            center: [lostPet.placeLng, lostPet.placeLat], // starting position [lng, lat]
            zoom: 12, // starting zoom
        });

        /* Inicializo el marker */
        const marker = new mapboxgl.Marker({
            draggable: true
        }).setLngLat([lostPet.placeLng, lostPet.placeLat]).addTo(map);

        function onDragEnd() {
            const lngLat = marker.getLngLat();
            lostPet.placeLng = lngLat.lng;
            lostPet.placeLat = lngLat.lat;
            console.log(lngLat);
        };

        marker.on('dragend', onDragEnd);

        /* Inicializo el buscador del mapa. */
        const geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl,
            countries: "Ar",
            marker: false,
            placeholder: lostPet.placeName
        });

        /* Al encontrar resultado crea un nuevo marcador para obtener la información precisa, además de obtener el nombre de la
             ubicación puesta en el buscador y guardar todo en el objeto "lostPet". */
        geocoder.on('result', (e) => {
            lostPet.placeName = e.result.text;
            lostPet.placeLng = e.result.center[0];
            lostPet.placeLat = e.result.center[1];

            const marker = new mapboxgl.Marker({
                draggable: true
            }).setLngLat([lostPet.placeLng, lostPet.placeLat]).addTo(map);

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

        /* Escucho el form para actualizar los datos de la mascota. */
        updatePetFormEl!.addEventListener("submit", e => {
            e.preventDefault();
            const petFinderLocalStorage = localStorage.getItem("pet-finder");
            const target = e.target as any;
            const petName = target.petName.value;
            let petPicture = undefined;
            const petDescription = target.petDescription.value;

            if (pictureFile) {
                petPicture = pictureFile.dataURL;
            };

            state.modifyOnePet(JSON.parse(petFinderLocalStorage!).token, parseInt(window.location.href.split("?")[1].split("=")[1]), petName, lostPet.placeLat, lostPet.placeLng, petDescription, "lost", lostPet.placeName, petPicture);
            Router.go("/published-pets");
        });

        /* Escucho el botón de encotrado para cambiar el estado de la mascota a "found". */
        foundButtonEl!.addEventListener("click", e => {
            const petFinderLocalStorage = localStorage.getItem("pet-finder");
            state.petFound(JSON.parse(petFinderLocalStorage!).token, parseInt(window.location.href.split("?")[1].split("=")[1]));
            Router.go("/published-pets");
        });

        /* Escucho el botón de borrado para borrar a la mascota de las bases de datos. */
        deleteButtonEl!.addEventListener("click", e => {
            const petFinderLocalStorage = localStorage.getItem("pet-finder");
            state.deleteOnePet(JSON.parse(petFinderLocalStorage!).token, parseInt(window.location.href.split("?")[1].split("=")[1]));
            Router.go("/published-pets");
        });
    };

    render() {
        this.innerHTML = `
            <header-comp></header-comp>
            <main class="main">
                <h1 class="title">Editar reporte de mascota perdida</h1>
                <form id="updatePetForm" class="form">
                    <label class="label" for="petName">Nombre</label>
                    <input type="text" maxlength="8" class="input" name="petName" id="petName">
                    
                    <p class="label">Foto de tu mascota</p>
                    <div class="profile-picture-container"></div>
                    
                    <p class="label">Marcá en el mapa el útlimo lugar en donde la viste (Tenés que poner la ubicación en el buscador y después mover el marcador a un lugar más preciso)</p>
                    <div id="geocoder" class="geocoder"></div>
                    <div id="mapbox"></div>

                    <label class="label"for="petDescription">Información útil para encontrarla</label>
                    <textarea maxlength="300" class="input" name="petDescription" id="petDescription" cols="30" rows="5"></textarea>

                    <button type="submit" id="updatePetForm__submit-button" class="button button--blue">Guardar información</button>
                    <button type="button" id="updatePetForm__found-button" class="button button--green">Reportar como encontrado</button>
                    <button type="button" id="updatePetForm__delete-button" class="button">Eliminar reporte</button>
                </form>
            </main>
        `;
    };
};

customElements.define("update-pet-page", UpdatePetPage);