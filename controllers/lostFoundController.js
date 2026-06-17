const LostFound = require("../models/LostFound");

// Create Lost/Found Post
exports.createPost = async (req, res) => {
  try {
    const post = await LostFound.create({
      userId: req.user.id,
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      type: req.body.type,
      image: req.file.path,
    });

    res.status(201).json(post);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await LostFound.find().sort({
      createdAt: -1,
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Get My Posts
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await LostFound.find({
      userId: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Post
exports.updatePost = async (req, res) => {
  try {
    const post = await LostFound.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    const updatedPost = await LostFound.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        type: req.body.type,
      },
      {
        new: true,
      }
    );

    res.status(200).json(updatedPost);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete My Post
exports.deletePost = async (req, res) => {
  try {
    const post = await LostFound.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    await LostFound.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Post deleted successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Filter Lost/Found Posts
exports.filterPosts = async (req, res) => {
  try {
    const posts = await LostFound.find({
      type: req.query.type,
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Mark Post as Resolved
exports.resolvePost = async (req, res) => {
  try {
    const post = await LostFound.findByIdAndUpdate(
      req.params.id,
      {
        status: "resolved",
      },
      {
        new: true,
      }
    );

    res.status(200).json(post);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};