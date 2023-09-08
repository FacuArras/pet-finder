import { state } from "../../state";
const authImage = require("url:../../img/auth-image.png");

class AuthPage extends HTMLElement {
    connectedCallback() {
        this.render();
        console.log(process.env.SECRET_KEY);
    };

    addListeners() {
        const loginFormEl = this.querySelector(".loginForm");

        loginFormEl!.addEventListener("submit", e => {
            const target = e.target as any;
            e.preventDefault();

            state.login(target.email.value, target.password.value);
        });
    };

    render() {
        this.innerHTML = `
            <header-comp></header-comp>
            <main class="main">
                <img class="main__image--auth" src="${authImage}">
                <h1 class="title main__title--auth">Iniciar sesión</h1>
                <h3 class="subtitle">Ingresá los siguientes datos para inciar sesión</h3>
                <form class="form loginForm">
                    <label class="label" for="email">Email</label>
                    <input type="email" class="input" name="email" id="email" required>

                    <label class="label" for="password">Contraseña</label>
                    <input type="password" class="input" name="password" id="password" required>

                    <p class="registerQuestion">No tenés cuenta?
                        <a href="/register" class="registerQuestion__link">Registrate</a>
                    </p>

                    <button type="submit" class="button button--blue button--auth" id="buttonFormLogin">Iniciar sesión</button>
                </form>
            </main>
        `;

        this.addListeners();
    };
};

customElements.define("auth-page", AuthPage);