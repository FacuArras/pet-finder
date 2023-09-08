import { Router } from "@vaadin/router";

const API_BASE_URL = process.env.BACKEND_URL || "http://127.0.0.1:3000";

const state = {
    login(userEmail, userPassword) {
        if (userEmail && userPassword) {
            fetch(API_BASE_URL + "/auth/token", {
                method: "post",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    userEmail, userPassword
                })
            }).then(res => {
                return res.json();
            }).then(data => {
                localStorage.setItem("pet-finder", JSON.stringify({ "token": data }));
                Router.go("/home");
            });
        } else {
            throw "No se han recibido correctamente los parámetros.";
        };
    },

    createUser(userFullName: string, userEmail: string, userPhoneNumber: number, userPassword: string, userProfilePicture: string) {
        fetch(API_BASE_URL + "/auth", {
            method: "post",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                userFullName,
                userEmail,
                userPhoneNumber,
                userPassword,
                userProfilePicture
            })
        }).then(res => {
            return res.json();
        }).then(data => {
            console.log(data);
        });
    },

    async getUser(token) {
        const response = await fetch(API_BASE_URL + "/auth/me", {
            method: "get",
            headers: {
                "content-type": "application/json",
                "authorization": "Bearer " + token
            },
        });

        const data = await response.json();

        return data;
    },

    async updateUser(token, userFullName: string, userEmail: string, userPhoneNumber: number, userProfilePicture?: string) {
        const response = await fetch(API_BASE_URL + "/users/me", {
            method: "put",
            headers: {
                "content-type": "application/json",
                "authorization": "Bearer " + token
            },
            body: JSON.stringify({
                "full_name": userFullName,
                "email": userEmail,
                "phone_number": userPhoneNumber,
                "profile_picture_URL": userProfilePicture
            })
        });

        const data = await response.json();

        console.log(data);
    },

    async createPet(token, petFullName: string, petPicture: string, petLastLocationLat: number, petLastLocationLng: number, petDescription: string, petState: string, petLastSeen: string) {
        const response = await fetch(API_BASE_URL + "/pets", {
            method: "post",
            headers: {
                "content-type": "application/json",
                "authorization": "Bearer " + token
            },
            body: JSON.stringify({
                petFullName,
                petPicture,
                petLastLocationLat,
                petLastLocationLng,
                petDescription,
                petState,
                petLastSeen
            })
        });

        const data = await response.json()

        console.log(data);
    },

    async getAllPetsFromUser(token) {
        const response = await fetch(API_BASE_URL + "/pets/me", {
            method: "get",
            headers: {
                "content-type": "application/json",
                "authorization": "Bearer " + token
            }
        });

        const data = await response.json();

        console.log(data);
        return data;
    },

    async getPetsNearby(lat: number, lng: number) {
        const response = await fetch(API_BASE_URL + "/pets/nearby?lat=" + lat + "&lng=" + lng, {
            method: "get",
            headers: {
                "content-type": "application/json"
            }
        });

        const data = await response.json();

        console.log(data);
        return data;
    },

    async getOnePet(petId: number) {
        const response = await fetch(API_BASE_URL + "/pets/" + petId, {
            method: "get",
            headers: {
                "content-type": "application/json"
            }
        });

        const data = await response.json();

        console.log(data);
        return data;
    },

    async modifyOnePet(token, petId: number, petName: string, petLastLocationLat: number, petLastLocationLng: number, petDescription: string, petState: string, petLastSeen: string, petPicture?: string) {
        const response = await fetch(API_BASE_URL + "/pets/" + petId, {
            method: "put",
            headers: {
                "content-type": "application/json",
                "authorization": "Bearer " + token
            },
            body: JSON.stringify({
                "full_name": petName,
                "pet_picture_URL": petPicture,
                "last_location_lat": petLastLocationLat,
                "last_location_lng": petLastLocationLng,
                "description": petDescription,
                "state": petState,
                "last_seen": petLastSeen
            })
        });

        const data = await response.json();

        console.log(data);
        return data;
    },

    async petFound(token, petId: number) {
        const response = await fetch(API_BASE_URL + "/pets/" + petId, {
            method: "put",
            headers: {
                "content-type": "application/json",
                "authorization": "Bearer " + token
            },
            body: JSON.stringify({
                "state": "found"
            })
        });

        const data = await response.json();

        console.log(data);
        return data;
    },

    async deleteOnePet(token, petId: number) {
        const response = await fetch(API_BASE_URL + "/pets/" + petId, {
            method: "delete",
            headers: {
                "content-type": "application/json",
                "authorization": "Bearer " + token
            }
        });

        const data = await response.json();

        console.log(data);
        return data;
    },

    async createReport(petId: number, userFullName: string, message: string, userPhoneNumber?: number) {
        const response = await fetch(API_BASE_URL + "/reports/" + petId, {
            method: "post",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                userFullName,
                message,
                userPhoneNumber
            })
        });

        const data = await response.json();

        console.log(data);
        return data;
    },
};

export { state };