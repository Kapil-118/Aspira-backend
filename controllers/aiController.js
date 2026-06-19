// peerbridge-backend/controllers/aiController.js
const axios = require("axios");
const FormData = require("form-data");

exports.summarizeResume = async (req, res) => {
  try {
    // 1. Verify that the file buffer array exists in the request object
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        error:
          "Multer failed to buffer file. Ensure storage is set to memoryStorage.",
      });
    }

    // 2. Build the Multi-part payload structure
    const form = new FormData();

    // CRITICAL: We append the raw buffer alongside explicit metadata fields
    form.append("file", req.file.buffer, {
      filename: req.file.originalname || "resume.pdf",
      contentType: req.file.mimetype || "application/pdf",
      knownLength: req.file.size, // Enforces precise byte allocation for the stream
    });

    console.log(
      `Forwarding file block to Python service: ${req.file.originalname} (${req.file.size} bytes)`,
    );

    // 3. Post the form payload out to your Python service running on port 5005
    const pythonResponse = await axios.post(
      "https://srikapil-aspira-ai.hf.space/summarize",
      form,
      {
        headers: {
          ...form.getHeaders(), // Injects correct multi-part boundaries automatically
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      },
    );

    // 4. Send the successful summary content back to Postman/Frontend
    // Inside your exports.summarizeResume function, update the return statement:
    return res.status(200).json({
      success: true,
      summary: pythonResponse.data.summary,
      pros: pythonResponse.data.pros, // Pass pros along
      cons: pythonResponse.data.cons, // Pass cons along
      filename: pythonResponse.data.filename,
    });
  } catch (error) {
    // Improved verbose trace error handling
    if (error.response) {
      console.error("Python worker rejected payload:", error.response.data);
      return res.status(error.response.status).json({
        error: `Python Worker Error: ${JSON.stringify(error.response.data)}`,
      });
    }

    console.error("Network communication error:", error.message);
    return res.status(500).json({
      error: "AI service communication line dropped or timed out.",
    });
  }
};
