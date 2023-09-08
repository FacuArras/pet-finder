const petFinderLogo = require("url:../img/logo.svg");
const menuIcon = require("url:../img/menu.svg");
const closeMenuIcon = require("url:../img/closeMenu.svg");

class HeaderComponent extends HTMLElement {
    constructor() {
        super();
        this.render();
    }
    render() {
        const shadow = this.attachShadow({ mode: "open" });
        const header = document.createElement("header");

        header.innerHTML = `
            <nav>
                <a href="/home">
                    <img src="${petFinderLogo}" alt="petFinderLogo">
                </a>

                <img id="menu" src="${menuIcon}" alt="menu">
            </nav>
 
            <div class="offcanvas">
                <img id="closeMenu" src="${closeMenuIcon}" alt="closeMenu">
                
                <ul class="menuList">
                    <li class="menuItem">
                        <a href="/profile" class="menuItem__link">Mi perfil</a>
                    </li>
                    <li class="menuItem">
                        <a href="/lost-pets" class="menuItem__link">Mascotas perdidas cerca</a>
                    </li>
                    <li class="menuItem">
                        <a href="/publish-pets" class="menuItem__link">Reportar mascota perdida</a>
                    </li>
                    <li class="menuItem">
                        <a href="/published-pets" class="menuItem__link">Mis mascotas reportadas</a>
                    </li>
                </ul>

                <p class="menuAccount">¿Todavía no iniciaste sesión? Hacelo <a href="/auth" class="menuAccount__link">acá</a></p>
            </div>
        `;
        const style = document.createElement("style");

        style.innerHTML = `  
            header{
                z-index: 100;
                position: sticky; 
                top: 0;
                width: 100%; 
                box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
            }

            nav{
                padding: 20px 4%; 
                background-color: #26302E; 
                display:flex; 
                justify-content: space-between; 
                align-items: center;
            }

            @keyframes slideInLeft {
                0% {
                    transform: translateX(100%);
                }
                100% {
                    transform: translateX(0);
                }
            }

            @keyframes slideOutToRight {
                0% {
                    transform: translateX(0);
                }
                100% {
                    transform: translateX(100%);
                }
            }

            .offcanvas{
                display:flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 45px 8%;
                width: 70%;
                height: 85vh;
                background-color: #26302E;
                position: fixed;
                top: 0;
                right: -100%;
                z-index: 100;
                box-shadow: 0 0 4rem rgba(0, 0, 0, 0.5);
                border-radius: 0 0 0 25px;
            }  
            
            .offcanvas.active{
                animation: slideInLeft 0.3s ease-in-out forwards;
            }

            .offcanvas.closed{
                animation: slideOutToRight 0.5s ease-out forwards;
            }

            #closeMenu{
                width: 25px;
                margin-left: 90%;
            }

            .menuList{
                list-style: none;
                padding: 0;
                color: white;
                display: flex;
                flex-direction:column;
                align-items: flex-start;
                justify-content: center;
                gap: 5vh;
                font-size: 24px;
            }

            .menuItem__link{
                text-decoration:none;
                color:white;
            }

            .menuAccount{
                margin: 0;
                color: white;
                font-size: 16px;
                text-align: center;
            }

            .menuAccount__link{
                color: #5a8fec;
                text-decoration: underline;
            }
        `;

        const offcanvasIconEl = header.querySelector("#menu");
        const offcanvasEl = header.querySelector(".offcanvas") as any;
        const closeMenuIconEl = header.querySelector("#closeMenu");

        offcanvasIconEl!.addEventListener("click", () => {
            offcanvasEl!.classList.add("active");
            offcanvasEl!.style.right = "0";
        });

        closeMenuIconEl!.addEventListener("click", () => {
            offcanvasEl!.classList.remove("active");
            offcanvasEl!.classList.add("closed");

            setTimeout(() => {
                offcanvasEl!.style.right = "-100%";
                offcanvasEl!.classList.remove("closed");
            }, 500);
        });

        document.addEventListener("click", (e) => {
            if (
                offcanvasEl.classList.contains("active") &&
                !offcanvasEl.contains(e.target) &&
                e.target !== this
            ) {
                offcanvasEl.classList.remove("active");
                offcanvasEl!.classList.add("closed");

                setTimeout(() => {
                    offcanvasEl.style.right = "-100%";
                    offcanvasEl!.classList.remove("closed");
                }, 500);
            }
        });

        shadow.appendChild(header);
        shadow.appendChild(style);
    }
}
customElements.define("header-comp", HeaderComponent);