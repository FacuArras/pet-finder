import { Pet, User } from "../models/models";
import { cloudinary } from "../lib/cloudinary";
import { index } from "../lib/algolia";

/* Crea una mascota asociada a un usuario, subiendo toda su información tanto a Algolia como a Postgre, además de subir su foto a cloudinary.*/
export async function createPet(petFullName: string, petPicture: string, petLastLocationLat: number, petLastLocationLng: number, petDescription: string, petState: string, lastSeen: string, ownerId: number) {
    let pet = {
        full_name: petFullName,
        pet_picture_URL: petPicture,
        last_location_lat: petLastLocationLat,
        last_location_lng: petLastLocationLng,
        description: petDescription,
        state: petState,
        last_seen: lastSeen
    };

    const imagen = await cloudinary.uploader.upload(petPicture, {
        resource_type: "image",
        discard_original_filename: true,
        width: 1000
    });

    pet.pet_picture_URL = imagen.secure_url;

    const newPet = await Pet.create({
        ...pet,
        userId: ownerId
    });

    index.saveObject({
        objectID: newPet.get("id"),
        full_name: pet.full_name,
        _geoloc: {
            lat: pet.last_location_lat,
            lng: pet.last_location_lng
        },
        pet_picture_URL: pet.pet_picture_URL,
        last_seen: pet.last_seen,
        state: pet.state
    });

    return newPet;
};

/* Retorna todas las mascotas asociadas a un usuario. */
export async function getAllPetsFromUser(ownerId: number) {
    const pets = await Pet.findAll({
        where: { userId: ownerId },
        include: [User]
    });

    return pets;
};

/* Retorna todas las mascotas registradas. */
export async function getAllPets() {
    const allPets = await Pet.findAll();

    return allPets;
};

/* Retorna una única mascota con el id proporcionado. */
export async function getOnePet(petId: number) {
    const pet = await Pet.findOne({
        where: {
            id: petId
        },
        include: [User]
    });

    if (pet) {
        return pet;
    } else {
        throw "Mascota con el id " + petId + "no encontrada.";
    };
};

/* Retorna mascotas dentro de un radio de 5km. */
export async function getPetsNearby(petLastLocationLat: number, petLastLocationLng: number) {
    const pets = await index.search("", {
        aroundLatLng: [petLastLocationLat, petLastLocationLng].join(","),
        aroundRadius: 5000
    });

    if (pets) {
        return pets;
    } else {
        throw "No se han encontrado mascotas cerca";
    };
};

/* Función que hace que sea posible el modificar los datos de una mascota en Algolia. */
function bodyToIndex(body, id) {
    const respuesta: any = {};

    if (body.full_name) {
        respuesta.full_name = body.full_name;
    };
    if (body.state) {
        respuesta.state = body.state;
    };
    if (body.last_location_lat && body.last_location_lng) {
        respuesta._geoloc = {
            lat: body.last_location_lat,
            lng: body.last_location_lng
        };
    };
    if (body.last_seen) {
        respuesta.last_seen = body.last_seen;
    };
    if (id) {
        respuesta.objectID = id;
    };

    return respuesta;
};

/*  Busca una mascota por su ID y el ID del dueño, cuando la ecuentra la modifica tanto en la base de datos como en Algolia. */
export async function modifyOnePet(petId: number, ownerId: number, body) {
    const pet = await Pet.findOne({
        where: {
            id: petId,
            userId: ownerId
        }
    });

    if (pet) {
        if (body.pet_picture_URL) {
            const imagen = await cloudinary.uploader.upload(body.pet_picture_URL, {
                resource_type: "image",
                discard_original_filename: true,
                width: 1000
            });

            body.pet_picture_URL = imagen.secure_url;
        }
        const petModified = await pet.update(body);
        const indexPet = bodyToIndex(body, petId);
        const algoliaRes = await index.partialUpdateObject(indexPet);

        return petModified;
    } else {
        throw "La mascota asociada con el usuario no ha sido encontrada.";
    };
};

/* Borra una mascota según el id proporcionado, verificando el que el id del dueño coincida. */
export async function deleteOnePet(petId: number, ownerId: number) {
    const pet = await Pet.findOne({
        where: {
            id: petId,
            userId: ownerId
        }
    });

    if (pet) {
        const petDeleted = await Pet.destroy({
            where: {
                id: petId,
                userId: ownerId
            }
        });

        const indexPetDeleted = await index.deleteObject(petId.toString());

        return petDeleted;
    } else {
        throw "La mascota asociada con el usuario no ha sido encontrada.";
    };
};