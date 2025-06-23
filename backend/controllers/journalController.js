const Journal = require("../models/Journal");

const getUserIdFromReq = (req) => {
  // This function can fail if req.user is not set by the auth middleware
  return req.user ? req.user.id : null;
};

exports.createJournal = async (req, res) => {
  // DEBUGGING LOG: Announce that the function has been called.
  console.log("\n--- CREATE JOURNAL: Request Received ---");

  try {
    // DEBUGGING LOG: Log the entire incoming request body. This is the most important log.
    console.log(
      "[DEBUG] Request Body Received:",
      JSON.stringify(req.body, null, 2)
    );

    const {
      title,
      content,
      imageUrl,
      tags,
      relatedLinks,
      notes,
      reactions,
      category,
    } = req.body;
    const status = req.body.status || "draft";

    if (!title || !content) {
      console.error("[ERROR] Validation Failed: Title or content is missing.");
      return res
        .status(400)
        .json({ message: "Title and content are required." });
    }

    if (!req.user) {
      console.error("[ERROR] Authentication Failed: req.user is missing.");
      return res
        .status(401)
        .json({
          message: "Unauthorized: User not logged in or token invalid.",
        });
    }

    const userId = getUserIdFromReq(req);
    // DEBUGGING LOG: Verify the user ID was extracted successfully.
    console.log("[DEBUG] User ID from token:", userId);

    const journalData = {
      title,
      content,
      imageUrl,
      tags,
      relatedLinks,
      notes,
      reactions,
      category,
      status: status,
      user: userId,
    };

    // DEBUGGING LOG: Log the final object we are about to save to MongoDB.
    console.log(
      "[DEBUG] Journal object to be saved:",
      JSON.stringify(journalData, null, 2)
    );

    const journal = new Journal(journalData);
    const saved = await journal.save();

    console.log("[SUCCESS] Journal saved successfully with ID:", saved._id);
    res.status(201).json(saved);
  } catch (err) {
    // DEBUGGING LOG: Log the full error object to see detailed validation messages.
    console.error(
      "[CRITICAL] An error occurred in the createJournal catch block:",
      err
    );

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ message: "Validation failed: " + messages.join(", ") });
    } else if (err.name === "CastError" && err.path === "user") {
      return res
        .status(400)
        .json({ message: "Invalid user ID format for journal creation." });
    }
    res
      .status(500)
      .json({ message: "Error creating journal", error: err.message });
  }
};

// Other controller functions (get, update, delete) remain the same...

exports.getJournals = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({
          message: "Unauthorized: User not logged in or token invalid.",
        });
    }
    const userId = getUserIdFromReq(req);

    const journals = await Journal.find({ user: userId }).sort({
      updatedAt: -1,
    });
    res.json(journals);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching journals", error: err.message });
  }
};

exports.getJournal = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({
          message: "Unauthorized: User not logged in or token invalid.",
        });
    }
    const userId = getUserIdFromReq(req);

    const journal = await Journal.findById(req.params.id);

    if (!journal || journal.user.toString() !== userId.toString()) {
      return res
        .status(404)
        .json({ message: "Journal not found or unauthorized" });
    }

    res.json(journal);
  } catch (err) {
    if (err.name === "CastError" && err.path === "_id") {
      return res.status(400).json({ message: "Invalid journal ID format." });
    } else if (err.name === "CastError" && err.path === "user") {
      return res.status(400).json({ message: "Invalid user ID provided." });
    }
    res
      .status(500)
      .json({ message: "Error fetching journal", error: err.message });
  }
};

exports.updateJournal = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({
          message: "Unauthorized: User not logged in or token invalid.",
        });
    }
    const userId = getUserIdFromReq(req);

    const journal = await Journal.findById(req.params.id);

    if (!journal || journal.user.toString() !== userId.toString()) {
      return res
        .status(404)
        .json({ message: "Journal not found or unauthorized" });
    }

    const updated = await Journal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ message: "Validation failed: " + messages.join(", ") });
    } else if (
      err.name === "CastError" &&
      (err.path === "_id" || err.path === "user")
    ) {
      return res.status(400).json({ message: "Invalid ID format." });
    }
    res
      .status(500)
      .json({ message: "Error updating journal", error: err.message });
  }
};

exports.deleteJournal = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({
          message: "Unauthorized: User not logged in or token invalid.",
        });
    }
    const userId = getUserIdFromReq(req);

    const journal = await Journal.findById(req.params.id);

    if (!journal || journal.user.toString() !== userId.toString()) {
      return res
        .status(404)
        .json({ message: "Journal not found or unauthorized" });
    }

    await Journal.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    if (err.name === "CastError" && err.path === "_id") {
      return res.status(400).json({ message: "Invalid journal ID format." });
    } else if (err.name === "CastError" && err.path === "user") {
      return res.status(400).json({ message: "Invalid user ID provided." });
    }
    res
      .status(500)
      .json({ message: "Error deleting journal", error: err.message });
  }
};

exports.uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image file uploaded." });
  }

  const imageUrl = req.file.path;

  res.status(200).json({ imageUrl, message: "Image uploaded successfully." });
};
