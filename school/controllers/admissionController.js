import Admission from "../models/admissionModel.js";

export const createAdmission = async (req, res) => {

    try {

        // Form Data Check
        // console.log("BODY DATA => ", req.body);

        // Save Data
        const savedData = await Admission.create(req.body);

        console.log("SAVED DATA => ", savedData);

        res.send("Form Submitted Successfully");

    } 
    
    catch (error) {

        console.log("ERROR => ", error);

        res.status(500).send(error.message);

    }

};