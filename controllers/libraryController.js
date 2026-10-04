import User from "../models/User.js";
import LibraryIssue from "../models/LibraryIssue.js";

import LibraryBook from "../models/LibraryBook.js";


// ==========================================
// ADD BOOK PAGE
// ==========================================

export const getAddBookPage = (req, res) => {
  try {
    return res.render(
      "ERP/library-add-book",
      {
        erpUser: req.session.erpUser,
      }
    );

  } catch (error) {
    console.error(
      "Add Book Page Error:",
      error
    );

    return res.status(500).send(
      "Unable to load add book page."
    );
  }
};


// ==========================================
// ADD BOOK
// ==========================================

export const addBook = async (req, res) => {
  try {

    if (!req.session?.erpUser) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const {
      bookName,
      author,
      isbn,
      category,
      publisher,
      quantity,
      description,
    } = req.body;


    if (
      !bookName ||
      !author ||
      !quantity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Book name, author and quantity are required.",
      });
    }


    const totalQuantity =
      Number(quantity);


    if (
      !Number.isInteger(totalQuantity) ||
      totalQuantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be at least 1.",
      });
    }


    const book =
      await LibraryBook.create({

        bookName:
          bookName.trim(),

        author:
          author.trim(),

        isbn:
          isbn?.trim() || "",

        category:
          category?.trim() || "",

        publisher:
          publisher?.trim() || "",

        quantity:
          totalQuantity,

        availableCopies:
          totalQuantity,

        description:
          description?.trim() || "",

        addedBy:
          req.session.erpUser.id,

        addedByName:
          req.session.erpUser.name,
      });


    return res.json({
      success: true,
      message:
        "Book added successfully.",
      book,
    });

  } catch (error) {

    console.error(
      "Add Book Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to add book.",
    });
  }
};

// ==========================================
// STUDENT BOOK SEARCH
// ==========================================

export const getStudentBooks = async (req, res) => {
  try {
    if (!req.session?.erpUser) {
      return res.redirect("/erp");
    }

    const search =
      req.query.search?.trim() || "";

    const filter = {};

    if (search) {
      filter.$or = [
        {
          bookName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          author: {
            $regex: search,
            $options: "i",
          },
        },
        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const books = await LibraryBook.find(filter)
      .sort({ bookName: 1 })
      .lean();

    return res.render(
      "ERP/student-library",
      {
        erpUser: req.session.erpUser,
        books,
        search,
      }
    );

  } catch (error) {
    console.error(
      "Student Library Error:",
      error
    );

    return res.status(500).send(
      "Unable to load library books."
    );
  }
};

// ==========================================
// SEARCH BOOKS API
// ==========================================

export const searchBooks = async (req, res) => {

  try {

    if (!req.session?.erpUser) {

      return res.status(401).json({
        success: false,
        message: "Please login first."
      });

    }


    const search =
      req.query.search?.trim() || "";


    if (!search) {

      return res.json({
        success: true,
        books: []
      });

    }


    const books = await LibraryBook.find({

      $or: [

        {
          bookName: {
            $regex: search,
            $options: "i"
          }
        },

        {
          author: {
            $regex: search,
            $options: "i"
          }
        },

        {
          isbn: {
            $regex: search,
            $options: "i"
          }
        },

        {
          category: {
            $regex: search,
            $options: "i"
          }
        }

      ]

    })
    .sort({ bookName: 1 })
    .lean();


    return res.json({

      success: true,
      books

    });


  } catch (error) {

    console.error(
      "Search Books Error:",
      error
    );


    return res.status(500).json({

      success: false,
      message: "Unable to search books."

    });

  }

};

// ==========================================
// ISSUE BOOK PAGE
// ==========================================

export const getIssueBookPage = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      active: true,
    })
      .select("name enrollment")
      .sort({ name: 1 })
      .lean();

    const books = await LibraryBook.find({
      availableCopies: { $gt: 0 },
    })
      .select(
        "bookName author isbn quantity availableCopies"
      )
      .sort({ bookName: 1 })
      .lean();

    return res.render(
      "ERP/library-issue-book",
      {
        erpUser: req.session.erpUser,
        students,
        books,
      }
    );

  } catch (error) {

    console.error(
      "Issue Book Page Error:",
      error
    );

    return res.status(500).send(
      "Unable to load issue book page."
    );
  }
};


// ==========================================
// ISSUE BOOK
// ==========================================

export const issueBook = async (req, res) => {
  try {

    if (!req.session?.erpUser) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const {
      studentId,
      bookId,
      dueDate,
    } = req.body;


    if (
      !studentId ||
      !bookId ||
      !dueDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Student, book and due date are required.",
      });
    }


    // Find student

    const student = await User.findOne({
      _id: studentId,
      role: "student",
      active: true,
    }).select("name enrollment");


    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }


    // Find book

    const book = await LibraryBook.findOne({
      _id: bookId,
    });


    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }


    // Check available copies

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "This book is currently not available.",
      });
    }


    // Check if same student already has
    // same book issued

    const existingIssue =
      await LibraryIssue.findOne({
        studentId: student._id,
        bookId: book._id,
        status: "Issued",
      });


    if (existingIssue) {
      return res.status(400).json({
        success: false,
        message:
          "This book is already issued to this student.",
      });
    }


    // Create issue record

    const issue =
      await LibraryIssue.create({

        studentId: student._id,

        enrollment:
          student.enrollment,

        studentName:
          student.name,

        bookId: book._id,

        bookName:
          book.bookName,

        issueDate:
          new Date(),

        dueDate:
          new Date(dueDate),

        status:
          "Issued",

        issuedBy:
          req.session.erpUser.id,

        issuedByName:
          req.session.erpUser.name,

      });


    // Decrease available copies

    book.availableCopies =
      Number(book.availableCopies) - 1;

    await book.save();


    return res.json({

      success: true,

      message:
        "Book issued successfully.",

      issue,

    });


  } catch (error) {

    console.error(
      "Issue Book Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to issue book.",

    });
  }
};

// ==========================================
// RETURN BOOK PAGE
// ==========================================

export const getReturnBookPage = async (req, res) => {
  try {

    const issues = await LibraryIssue.find({
      status: "Issued"
    })
      .sort({ dueDate: 1 })
      .lean();

    return res.render(
      "ERP/library-return-book",
      {
        erpUser: req.session.erpUser,
        issues
      }
    );

  } catch (error) {

    console.error(
      "Return Book Page Error:",
      error
    );

    return res.status(500).send(
      "Unable to load return book page."
    );
  }
};


// ==========================================
// RETURN BOOK
// ==========================================

export const returnBook = async (req, res) => {
  try {

    if (!req.session?.erpUser) {
      return res.status(401).json({
        success: false,
        message: "Please login first."
      });
    }


    const { issueId } = req.body;


    if (!issueId) {
      return res.status(400).json({
        success: false,
        message: "Issue ID is required."
      });
    }


    // Find issued book

    const issue =
      await LibraryIssue.findOne({
        _id: issueId,
        status: "Issued"
      });


    if (!issue) {
      return res.status(404).json({
        success: false,
        message:
          "Issued book record not found."
      });
    }


    // Find book

    const book =
      await LibraryBook.findById(
        issue.bookId
      );


    if (!book) {
      return res.status(404).json({
        success: false,
        message:
          "Book not found."
      });
    }


    // Update issue

    issue.returnDate = new Date();

    issue.status = "Returned";

    await issue.save();


    // Increase available copies

    book.availableCopies =
      Number(book.availableCopies) + 1;


    // Safety: available copies
    // should not exceed total quantity

    if (
      book.availableCopies >
      book.quantity
    ) {
      book.availableCopies =
        book.quantity;
    }


    await book.save();


    return res.json({

      success: true,

      message:
        "Book returned successfully.",

      issue

    });


  } catch (error) {

    console.error(
      "Return Book Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to return book."

    });
  }
};

// ==========================================
// STUDENT MY LIBRARY
// ==========================================

export const getMyLibrary = async (req, res) => {
  try {

    if (!req.session?.erpUser) {
      return res.redirect("/erp");
    }

    const enrollment =
      req.session.erpUser.enrollment;

    const issues = await LibraryIssue.find({
      enrollment: enrollment
    })
      .sort({ createdAt: -1 })
      .lean();


    // Check overdue books
    const now = new Date();

    const updatedIssues = issues.map((issue) => {

      let displayStatus = issue.status;

      if (
        issue.status === "Issued" &&
        new Date(issue.dueDate) < now
      ) {
        displayStatus = "Overdue";
      }

      return {
        ...issue,
        displayStatus
      };

    });


    return res.render(
      "ERP/student-my-library",
      {
        erpUser: req.session.erpUser,
        issues: updatedIssues
      }
    );


  } catch (error) {

    console.error(
      "My Library Error:",
      error
    );

    return res.status(500).send(
      "Unable to load my library."
    );
  }
};

// ==========================================
// LIBRARY FINE MANAGEMENT PAGE
// ==========================================

export const getLibraryFinePage = async (req, res) => {
  try {

    const issues = await LibraryIssue.find({
      status: {
        $in: ["Issued", "Overdue", "Returned"]
      }
    })
      .sort({ dueDate: 1 })
      .lean();


    const today = new Date();


    const updatedIssues = issues.map((issue) => {

      let lateDays = 0;
      let fineAmount = 0;
      let displayStatus = issue.status;


      // ==================================
      // RETURNED BOOK
      // ==================================

      if (
        issue.status === "Returned" &&
        issue.returnDate
      ) {

        const returnDate =
          new Date(issue.returnDate);

        const dueDate =
          new Date(issue.dueDate);


        if (returnDate > dueDate) {

          const difference =
            returnDate.getTime() -
            dueDate.getTime();

          lateDays =
            Math.ceil(
              difference /
              (1000 * 60 * 60 * 24)
            );

        }

      }


      // ==================================
      // CURRENTLY ISSUED BOOK
      // ==================================

      else if (
        issue.status === "Issued"
      ) {

        const dueDate =
          new Date(issue.dueDate);


        if (today > dueDate) {

          const difference =
            today.getTime() -
            dueDate.getTime();

          lateDays =
            Math.ceil(
              difference /
              (1000 * 60 * 60 * 24)
            );

          displayStatus = "Overdue";

        }

      }


      // ==================================
      // FINE CALCULATION
      // ==================================

      fineAmount =
        lateDays *
        Number(issue.finePerDay || 10);


      return {
        ...issue,
        lateDays,
        fineAmount,
        displayStatus
      };

    });


    return res.render(
      "ERP/library-fine-management",
      {
        erpUser: req.session.erpUser,
        issues: updatedIssues
      }
    );


  } catch (error) {

    console.error(
      "Library Fine Page Error:",
      error
    );

    return res.status(500).send(
      "Unable to load fine management."
    );

  }
};

// ==========================================
// FINE PAYMENT PAGE
// ==========================================

export const getFinePaymentPage = async (req, res) => {
  try {

    const issues = await LibraryIssue.find({
      fineAmount: { $gt: 0 }
    })
      .sort({ createdAt: -1 })
      .lean();


    const today = new Date();


    const updatedIssues = issues.map((issue) => {

      let lateDays = 0;
      let fineAmount = 0;


      // Returned book
      if (
        issue.status === "Returned" &&
        issue.returnDate
      ) {

        const returnDate =
          new Date(issue.returnDate);

        const dueDate =
          new Date(issue.dueDate);


        if (returnDate > dueDate) {

          const difference =
            returnDate.getTime() -
            dueDate.getTime();

          lateDays = Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
          );

        }

      }


      // Issued / overdue book
      else if (
        issue.status === "Issued" ||
        issue.status === "Overdue"
      ) {

        const dueDate =
          new Date(issue.dueDate);


        if (today > dueDate) {

          const difference =
            today.getTime() -
            dueDate.getTime();

          lateDays = Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
          );

        }

      }


      fineAmount =
        lateDays *
        Number(issue.finePerDay || 10);


      return {
        ...issue,
        lateDays,
        fineAmount
      };

    });


    return res.render(
      "ERP/library-fine-payment",
      {
        erpUser: req.session.erpUser,
        issues: updatedIssues
      }
    );


  } catch (error) {

    console.error(
      "Fine Payment Page Error:",
      error
    );

    return res.status(500).send(
      "Unable to load fine payment page."
    );

  }
};


// ==========================================
// MARK FINE AS PAID
// ==========================================

export const markFinePaid = async (req, res) => {
  try {

    if (!req.session?.erpUser) {

      return res.status(401).json({
        success: false,
        message: "Please login first."
      });

    }


    const { issueId } = req.body;


    if (!issueId) {

      return res.status(400).json({
        success: false,
        message: "Issue ID is required."
      });

    }


    const issue =
      await LibraryIssue.findById(issueId);


    if (!issue) {

      return res.status(404).json({
        success: false,
        message: "Library issue record not found."
      });

    }


    if (Number(issue.fineAmount || 0) <= 0) {

      return res.status(400).json({
        success: false,
        message: "No fine is pending for this book."
      });

    }


    if (issue.finePaid === true) {

      return res.status(400).json({
        success: false,
        message: "Fine is already paid."
      });

    }


    issue.finePaid = true;

    issue.finePaidDate = new Date();


    await issue.save();


    return res.json({

      success: true,

      message: "Fine marked as paid successfully.",

      fineAmount: issue.fineAmount,

      finePaidDate: issue.finePaidDate

    });


  } catch (error) {

    console.error(
      "Mark Fine Paid Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message: "Unable to update fine payment."

    });

  }
};