import { state } from "../../state";
import Dropzone from "dropzone";
import { Router } from "@vaadin/router";

class ProfilePage extends HTMLElement {
    async connectedCallback() {
        /* Obtengo el objeto de localStorage. */
        const petFinderLocalStorage = localStorage.getItem("pet-finder");

        /* Si no existe el objeto en localStorage no le permito entrar a esta página y lo mando de nuevo a /home. */
        if (petFinderLocalStorage) {
            /* Si existe, obtengo el token guardado y lo ejecuto en la función "getUser" para obtener la información del usuario. */
            try {
                const dbUser = await state.getUser(JSON.parse(petFinderLocalStorage!).token);

                this.render();

                this.addProfileInfo(dbUser);
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
    addProfileInfo(dbUser) {
        const user = {
            userFullName: dbUser.full_name,
            userEmail: dbUser.email,
            userPhoneNumber: dbUser.phone_number,
            userProfilePicture: dbUser.profile_picture_URL
        };
        const inputFullNameEl = this.querySelector("#fullname") as any;
        const inputEmailEl = this.querySelector("#email") as any;
        const inputPhoneNumberEl = this.querySelector("#phoneNumber") as any;

        if (user.userProfilePicture) {
            const pictureContainerEl = this.querySelector(".profile-picture-container") as any;
            pictureContainerEl!.style.backgroundImage = "url('" + user.userProfilePicture + "')";
        };

        inputFullNameEl!.value = user.userFullName;
        inputEmailEl!.value = user.userEmail;
        inputPhoneNumberEl!.value = user.userPhoneNumber;
    };

    addListeners() {
        const buttonEditProfileEl = this.querySelector("#buttonEditProfile") as any;
        const buttonSaveProfileEl = this.querySelector("#buttonSaveProfile") as any;
        const inputFullNameEl = this.querySelector("#fullname") as any;
        const inputEmailEl = this.querySelector("#email") as any;
        const inputPhoneNumberEl = this.querySelector("#phoneNumber") as any;
        const formEditProfileEl = this.querySelector("#editProfileForm") as any;
        let pictureFile;

        /* Al hacer click en "Modificar datos" todos los inputs son editables y se puede cambiar la foto de perfil. */
        buttonEditProfileEl!.addEventListener("click", e => {
            inputFullNameEl.removeAttribute("readonly");
            inputEmailEl.removeAttribute("readonly");
            inputPhoneNumberEl.removeAttribute("readonly");
            buttonEditProfileEl.style.display = "none";
            buttonSaveProfileEl.style.display = "block";

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
        });

        /* Esucho todos los cambios para poder mandarlos a la base de datos. */
        formEditProfileEl.addEventListener("submit", e => {
            e.preventDefault();
            const petFinderLocalStorage = localStorage.getItem("pet-finder");

            if (buttonEditProfileEl.style.display === "none") {
                const target = e.target as any;

                state.updateUser(
                    JSON.parse(petFinderLocalStorage!).token,
                    target.fullname.value,
                    target.email.value,
                    target.phoneNumber.value,
                    pictureFile.dataURL
                );

                Router.go("/profile");
            };
        });

    };

    render() {
        this.innerHTML = `
            <header-comp></header-comp>
            <main class="main">
                <h1 class="title main__title--profile-page">Mi perfil</h1>
                <form id="editProfileForm" class="form">
                    <div class="profile-picture-container editProfileForm__profile-picture-container"></div>

                    <label class="label" for="fullname">Nombre completo</label>
                    <input type="text" class="input" name="fullname" id="fullname" readonly>

                    <label class="label" for="email">Email</label>
                    <input type="email" class="input" name="email" id="email" readonly>
                    
                    <label class="label" for="phoneNumber">Número de teléfono</label>
                    <input type="number" class="input" name="phoneNumber" id="phoneNumber" readonly>

                    <button type="submit" class="button button--blue" id="buttonSaveProfile">Guardar datos modificados</button>
                    <button type="button" class="button button--green" id="buttonEditProfile">Modificar Datos</button>
                </form>
            </main>
        `;

        this.addListeners();
    };
};

customElements.define("profile-page", ProfilePage);