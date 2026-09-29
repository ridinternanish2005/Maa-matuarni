// courseModel.js

const getCourses = () => {
    return [
        {
            code: "B.TECH-CSE",
            name: "B.Tech Computer Science",
            duration: "4 Years",
            fees: "120000"
        },
        {
            code: "MBA",
            name: "Master of Business Administration",
            duration: "2 Years",
            fees: "250000"
        }
    ];
};

export default { getCourses };