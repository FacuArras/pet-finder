import { Pet, User, Report } from "../models/models";
import { resend } from "../lib/resend";

/* Crea un nuevo reporte mandando la información a través de un mail usando Resend y guardando los datos en Postgre. */
export async function createReport(petId: number, userFullName: string, message: string, userPhoneNumber: number, userEmail: string, petName: string) {
    let report = {
        full_name: userFullName,
        message,
        phone_number: userPhoneNumber
    };

    await resend.emails.send({
        from: 'petfinder@resend.dev',
        to: userEmail,
        subject: '¡Hay noticias sobre ' + petName + "!",
        text: message
    });

    const newReport = await Report.create({
        ...report,
        petId
    });

    return newReport;
};

/* Obtiene todos los reportes asociados a una mascota. */
export async function getAllReportsFromPet(petId: number) {
    const reports = await Report.findAll({
        where: {
            petId
        }
    });

    return reports;
};