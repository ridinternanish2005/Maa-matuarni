// import dotenv from "dotenv";
// dotenv.config();

// import dns from "node:dns";

// dns.setServers([
//   "8.8.8.8",
//   "1.1.1.1"
// ]);

// import bcrypt from "bcryptjs";
// import connectDB from "./config/db.js";
// import ERPUser from "./models/ERPUser.js";

// const createERPUser = async () => {
//   try {
//     await connectDB();

//     const password = "MyPassword123";
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await ERPUser.create({
//       enrollment: "ADM001",
//       password: hashedPassword,
//       role: "admin",
//       session: "2025-26",
//       active: true
//     });

//     console.log("ERP User Created Successfully");

//     console.log({
//       enrollment: user.enrollment,
//       role: user.role,
//       session: user.session,
//       active: user.active
//     });

//     process.exit(0);
//   } catch (error) {
//     console.error("Error creating ERP user:", error);
//     process.exit(1);
//   }
// };

// createERPUser();

//////////////////////////////////////////////////////////////////////////////////////////////

// import dotenv from "dotenv";
// dotenv.config();

// import dns from "node:dns";
// dns.setServers(["8.8.8.8", "1.1.1.1"]);

// import bcrypt from "bcryptjs";
// import connectDB from "../config/db.js";
// import ERPUser from "../models/ERPUser.js";

// const createERPUsers = async () => {
//   try {
//     await connectDB();

//     const password = "MyPassword123";
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const users = [
//       {
//         enrollment: "STU001",
//         password: hashedPassword,
//         role: "student",
//         session: "2025-26",
//         active: true
//       },
//       {
//         enrollment: "FAC001",
//         password: hashedPassword,
//         role: "faculty",
//         session: "2025-26",
//         active: true
//       },
//       {
//         enrollment: "ADM001",
//         password: hashedPassword,
//         role: "admin",
//         session: "2025-26",
//         active: true
//       },
//       {
//         enrollment: "PRI001",
//         password: hashedPassword,
//         role: "principal",
//         session: "2025-26",
//         active: true
//       }
//     ];

//     await ERPUser.deleteMany({
//       enrollment: {
//         $in: ["STU001", "FAC001", "ADM001", "PRI001"]
//       }
//     });

//     const result = await ERPUser.insertMany(users);

//     console.log("Users created successfully:");

//     result.forEach((user) => {
//       console.log(
//         user.enrollment,
//         "=>",
//         user.role
//       );
//     });

//     console.log("Temporary Password:", password);

//     process.exit(0);

//   } catch (error) {
//     console.error("Error:", error);
//     process.exit(1);
//   }
// };

// createERPUsers();