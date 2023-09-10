import { User } from "../models/models";
import { Auth } from "../models/auth";
import { cloudinary } from "../lib/cloudinary";
import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";

function getSHA256ofString(text: string) {
    return crypto.createHash("sha256").update(text).digest("hex");
};

/* Registrarse: Esta función se encarga de crear o encontrar un usuario en la base de datos, subir una imagen de perfil a Cloudinary (si se proporciona)
        y crear o encontrar un registro de autenticación asociado al mismo. Retornando si fueron creados o encontrados, junto a su respectiva información.*/
export async function createUser(userFullName: string, userEmail: string, userPhoneNumber: number, password: string, userProfilePicture?: string) {
    let userFoC = {
        full_name: userFullName,
        email: userEmail,
        phone_number: userPhoneNumber,
        profile_picture_URL: ""
    };

    if (userProfilePicture) {
        const imagen = await cloudinary.uploader.upload(userProfilePicture, {
            resource_type: "image",
            discard_original_filename: true,
            width: 1000
        });

        userFoC.profile_picture_URL = imagen.secure_url;
    };

    const [user, userCreated] = await User.findOrCreate({
        where: {
            email: userFoC.email
        },
        defaults: {
            full_name: userFoC.full_name,
            email: userFoC.email,
            phone_number: userFoC.phone_number,
            profile_picture_URL: userFoC.profile_picture_URL
        },
    });

    const [auth, authCreated] = await Auth.findOrCreate({
        where: {
            user_id: user.get("id")
        },
        defaults: {
            email: userFoC.email,
            password: getSHA256ofString(password),
            user_id: user.get("id")
        }
    });

    return [{ userCreated, user }, { authCreated, auth }];
};

/* Iniciar sesión: Esta función se encarga de autenticar un usuario, verificando si las credenciales proporcionadas (email y contraseña) coinciden con las registradas en la base de datos.
        Si las credenciales son válidas se genera un token que proporciona el id del usuario.*/
export async function signIn(email: string, password: string) {
    if (email && password) {
        const auth = await Auth.findOne({
            where: {
                email,
                password: getSHA256ofString(password)
            }
        });

        if (auth) {
            const token = jwt.sign({ id: auth.get("user_id") }, process.env.SECRET);
            return token;
        } else {
            throw "El usuario no ha sido encontrado.";
        };
    } else {
        throw "No se han recibido los datos del usuario correctamente.";
    };
};

/* Retorna todos los usuarios registrados */
export async function getAllUsers() {
    const allUsers = await User.findAll();

    return allUsers;
};

/* Obtiene un usuario único con el id proporcionado. */
export async function getOneUser(userId: number) {
    const user = await User.findOne({
        where: {
            id: userId
        }
    });

    if (user) {
        return user;
    } else {
        throw "Usuario con el id " + userId + "no encontrado.";
    };
};

/*  Busca el usuario por su ID, luego lo modifica.*/
export async function modifyOneUser(userId: number, body) {
    const user = await getOneUser(userId);

    if (user) {
        if (body.profile_picture_URL) {
            const imagen = await cloudinary.uploader.upload(body.profile_picture_URL, {
                resource_type: "image",
                discard_original_filename: true,
                width: 1000
            });

            body.profile_picture_URL = imagen.secure_url;
        };

        const userModified = await user.update(body);

        return userModified;
    } else {
        throw "Usuario con el id " + userId + "no encontrado.";
    };
};

/* Borra un usuario según el id proporcionado. */
export async function deleteOneUser(userId: number) {
    const userDeleted = await User.destroy({
        where: {
            id: userId
        }
    });

    return userDeleted;
};