import Feedback from "../models/Feedback.js";

export const submitFeedback = async (req, res) => {

    try {

        console.log(req.body);

        const {
            name,
            email,
            relation,
            rating,
            message
        } = req.body;

        const feedback = new Feedback({
            name,
            email,
            relation,
            rating,
            message
        });

        await feedback.save();

        console.log("✅ Saved");

        res.redirect("/");

    } catch (error) {

        console.log("❌ ERROR:", error);

        res.status(500).send(error.message);
    }
};