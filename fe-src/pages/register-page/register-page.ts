import { Router } from "@vaadin/router";
import { state } from "../../state";
import Dropzone from "dropzone";

class RegisterPage extends HTMLElement {
    connectedCallback() {
        this.render();
    };

    addListeners() {
        let pictureFile;
        const loginFormEl = this.querySelector(".registerForm");

        /* Inicializo Dropzone. */
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

        /* Escucho el formulario. */
        loginFormEl!.addEventListener("submit", e => {
            const target = e.target as any;
            e.preventDefault();

            const user = {
                userFullName: target.fullname.value,
                userEmail: target.email.value,
                userPhoneNumber: target.phoneNumber.value,
                userPassword: target.password.value.toString(),
                pictureDataURL: ""
            }

            if (pictureFile) {
                user.pictureDataURL = pictureFile.dataURL;
            };

            state.createUser(user.userFullName, user.userEmail, user.userPhoneNumber, user.userPassword, user.pictureDataURL);

            /* Luego de registrarse lo mando al inicio de sesión para obtener el token. */
            Router.go("/auth");
        });
    };



    render() {
        this.innerHTML = `
            <header-comp></header-comp>
            <main class="main main--register">
                <h1 class="title">Registrate</h1>
                <h3 class="subtitle">Ingresá los siguientes datos para realizar el registro</h3>
                <form class="form registerForm">
                    <p class="label">Foto de perfil (opcional)</p>
                    <div class="profile-picture-container"></div>

                    <label class="label" for="fullname">Nombre completo</label>
                    <input type="text" class="input" name="fullname" id="fullname" required>

                    <label class="label" for="email">Email</label>
                    <input type="email" class="input" name="email" id="email" required>
                    
                    <label class="label" for="phoneNumber">Número de teléfono</label>
                    <input type="number" class="input" name="phoneNumber" id="phoneNumber" required>

                    <label class="label" for="password">Contraseña</label>
                    <input type="password" class="input" name="password" id="password" required>

                    <button type="submit" class="button button--blue button--auth" id="buttonFormLogin">Registrarse</button>
                </form>
            </main>
        `;

        this.addListeners();
    };
};

customElements.define("register-page", RegisterPage);