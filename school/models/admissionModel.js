import mongoose from "mongoose";

const admissionSchema = new mongoose.Schema({

    studentName: String,
    dob: String,
    classSelect: String,
    parentName: String,
    phone: String,
    email: String,
    address: String

});

const Admission = mongoose.model("Admission", admissionSchema);

export default Admission;