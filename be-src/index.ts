import 'dotenv/config';
import * as path from "path";
import * as express from "express";
import * as jwt from "jsonwebtoken";
import * as process from "process";
import * as cors from "cors";
import { createUser, getAllUsers, getOneUser, modifyOneUser, deleteOneUser, signIn } from "./controllers/user-controllers"
import { createPet, getAllPetsFromUser, getAllPets, getOnePet, modifyOnePet, deleteOnePet, getPetsNearby } from "./controllers/pet-controllers";
import { createReport, getAllReportsFromPet } from "./controllers/report-controllers";

const port = process.env.PORT || 3000;
const app = express();

const pathStaticDir = path.resolve(__dirname, "../dist");

app.use(express.json({
    limit: "50mb"
}));

app.use(cors());

app.use(express.static(pathStaticDir));

/* Crear un usuario. */
app.post("/auth", async (req, res) => {
    try {
        const { userFullName, userEmail, userPhoneNumber, userPassword } = req.body;

        if (req.body.userProfilePicture) {
            const newUser = await createUser(userFullName, userEmail, userPhoneNumber, userPassword, req.body.userProfilePicture);

            if (newUser) {
                res.status(201).json(newUser);
            } else {
                res.status(500).json({ error: "Ha ocurrido un error en la creación del usuario." });
            }
        } else {
            const newUser = await createUser(userFullName, userEmail, userPhoneNumber, userPassword);

            if (newUser) {
                res.status(201).json(newUser);
            } else {
                res.status(500).json({ error: "Ha ocurrido un error en la creación del usuario." });
            };
        };

    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    };
});

/* Iniciar sesión. */
app.post("/auth/token", async (req, res) => {
    try {
        const { userEmail, userPassword } = req.body;

        const auth = await signIn(userEmail, userPassword);

        res.status(200).json(auth);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    };
});

/* Middleware de autenticación. */
function authMiddleware(req, res, next) {
    try {
        const token = req.headers.authorization.split(" ")[1];

        const data = jwt.verify(token, process.env.SECRET);
        req._user = data;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ error: "Error al iniciar sesión." });
    };
};

/* Información del usuario. */
app.get("/auth/me", authMiddleware, async (req, res) => {
    try {
        const user = await getOneUser(req._user.id);

        res.status(302).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    };
});

/* Obtener todos los usuarios. */
app.get("/users", async (req, res) => {
    try {
        const allUsers = await getAllUsers();

        res.status(200).json(allUsers);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    };
});

/* Obtener un usuario único con el id proporcionado. */
app.get("/users/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await getOneUser(userId);

        res.status(302).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    };
});

/* Modificar un usuario. */
app.put("/users/me", authMiddleware, async (req, res) => {
    try {
        const userModified = await modifyOneUser(req._user.id, req.body);

        res.status(200).json(userModified);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    };
});

/* Borrar un usuario. */
app.delete("/users/me", authMiddleware, async (req, res) => {
    try {
        const userDeleted = await deleteOneUser(req._user.id,);

        res.status(200).json({ userDeleted, message: "Usuario borrado correctamente." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    };
});

/* Crear una nueva mascota asociada a un usuario. */
app.post("/pets", authMiddleware, async (req, res) => {
    try {
        const { petFullName, petPicture, petLastLocationLat, petLastLocationLng, petDescription, petState, petLastSeen } = req.body;

        const newPet = await createPet(petFullName, petPicture, petLastLocationLat, petLastLocationLng, petDescription, petState, petLastSeen, req._user.id);

        if (newPet) {
            res.status(201).json(newPet);
        } else {
            res.status(500).json({ error: "Ha ocurrido un error en la creación de la mascota." });
        };
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    };
});

/* Obtener todas las mascotas de un usuario. */
app.get("/pets/me", authMiddleware, async (req, res) => {
    try {
        const pets = await getAllPetsFromUser(req._user.id);

        res.status(200).json(pets);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    };
});

/* Obtener todas las mascotas. */
app.get("/pets", async (req, res) => {
    try {
        const allPets = await getAllPets();

        res.status(200).json(allPets);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    };
});

/* Obtener mascotas dentro de un radio de 5km. */
app.get("/pets/nearby", async (req, res) => {
    try {
        const { lat, lng } = req.query;

        const pets = await getPetsNearby(lat, lng);

        res.status(302).json(pets);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    };
});

/* Obtener una mascota con el id propocionado. */
app.get("/pets/:petId", async (req, res) => {
    try {
        const { petId } = req.params;

        const pet = await getOnePet(petId);

        res.status(302).json(pet);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    };
});

/* Modificar una mascota. */
app.put("/pets/:petId", authMiddleware, async (req, res) => {
    try {
        const { petId } = req.params;

        const petModified = await modifyOnePet(petId, req._user.id, req.body);

        res.status(200).json(petModified);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    };
});

/* Eliminar una mascota. */
app.delete("/pets/:petId", authMiddleware, async (req, res) => {
    try {
        const { petId } = req.params;

        const deletedPet = await deleteOnePet(petId, req._user.id);

        res.status(200).json({ deletedPet, message: "Mascota eliminada correctamente." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    };
});

/* Crear reporte. */
app.post("/reports/:petId", async (req, res) => {
    try {
        const { petId } = req.params;
        const { userFullName, message, userPhoneNumber, userEmail, petName } = req.body;

        const report = await createReport(petId, userFullName, message, userPhoneNumber, userEmail, petName);
        res.status(201).json(report);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    };
});

/* Obtener los reportes asociados a una mascota. */
app.get("/reports/:petId", async (req, res) => {
    try {
        const { petId } = req.params;

        const reports = await getAllReportsFromPet(petId);

        if (reports) {
            res.status(302).json(reports);
        } else {
            res.status(404).json({ error: "No se han encontrado reportes sobre esta mascota." });
        };
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    };
});

app.get("*", (req, res) => {
    res.sendFile(pathStaticDir + "/index.html");
});

app.listen(port, () => {
    console.log("Aplicación lista y escuchando en el puerto: " + port);
});