import { Pet, User, Report } from "../models/models";

export async function createReport(petId: number, userFullName: string, message: string, userPhoneNumber: number) {
    let report = {
        full_name: userFullName,
        message,
        phone_number: userPhoneNumber
    };

    const newReport = await Report.create({
        ...report,
        petId
    });

    return newReport;
};

export async function getAllReportsFromPet(petId: number) {
    const reports = await Report.findAll({
        where: {
            petId
        }
    });

    return reports;
};