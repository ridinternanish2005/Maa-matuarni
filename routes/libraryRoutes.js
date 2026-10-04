import express from "express";

import {
  getAddBookPage,
  addBook,
  getStudentBooks,
  searchBooks,
  getIssueBookPage,
  issueBook,
  getReturnBookPage,
  returnBook,
  getMyLibrary,
  getLibraryFinePage,
  getFinePaymentPage,
  markFinePaid
} from "../controllers/libraryController.js";

import { requireERPRole } from "../middleware/erpAuth.js";


const router = express.Router();


// ==========================================
// ADD BOOK PAGE
// ==========================================

router.get(
  "/library/add-book",
  requireERPRole(
    "admin",
    "faculty",
    "principal"
  ),
  getAddBookPage
);


// ==========================================
// ADD BOOK
// ==========================================

router.post(
  "/library/add-book",
  requireERPRole(
    "admin",
    "faculty",
    "principal"
  ),
  addBook
);


router.get(
  "/students/library",
  requireERPRole("student"),
  getStudentBooks
);

router.get(
  "/library/search",
  requireERPRole("student"),
  searchBooks
);



// ==========================================
// ISSUE BOOK
// ==========================================

router.get(
  "/library/issue-book",
  requireERPRole(
    "admin",
    "faculty",
    "principal"
  ),
  getIssueBookPage
);


router.post(
  "/library/issue-book",
  requireERPRole(
    "admin",
    "faculty",
    "principal"
  ),
  issueBook
);


// ==========================================
// RETURN BOOK
// ==========================================

router.get(
  "/library/return-book",
  requireERPRole(
    "admin",
    "faculty",
    "principal"
  ),
  getReturnBookPage
);


router.post(
  "/library/return-book",
  requireERPRole(
    "admin",
    "faculty",
    "principal"
  ),
  returnBook
);


// ==========================================
// STUDENT MY LIBRARY
// ==========================================

router.get(
  "/students/my-library",
  requireERPRole("student"),
  getMyLibrary
);


// ==========================================
// LIBRARY FINE MANAGEMENT
// ==========================================

router.get(
  "/library/fine-management",
  requireERPRole(
    "admin",
    "faculty",
    "principal"
  ),
  getLibraryFinePage
);

// ==========================================
// FINE PAYMENT
// ==========================================

router.get(
  "/library/fine-payment",
  requireERPRole(
    "admin",
    "faculty",
    "principal"
  ),
  getFinePaymentPage
);


router.patch(
  "/library/fine-payment/pay",
  requireERPRole(
    "admin",
    "faculty",
    "principal"
  ),
  markFinePaid
);
export default router;