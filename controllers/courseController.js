import path from "path";
import { fileURLToPath } from "url";
import courseModel from "../models/courseModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAllCourses = (req, res) => {

    const courses = courseModel.getCourses();   // model data

    console.log(courses); // optional

    res.sendFile(path.join(__dirname, "../views/allcourses.ejs"));
};