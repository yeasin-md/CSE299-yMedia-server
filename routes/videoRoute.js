const router = require("express").Router();
const Banners = require("../models/Banners");
const Categories = require("../models/Categories");
const Video = require("../models/Video");
const {
  verifyTokenAndAdmin,
  verifyTokenAndAuthorization,
  verifyToken,
} = require("./verifyToken");

//Create Video ===
router.post("/upload", verifyToken, async (req, res) => {
  const newVideo = new Video(req.body);
  try {
    const savedVideo = await newVideo.save();
    res.status(200).json(savedVideo);
  } catch (error) {
    res.status(500).json(error);
  }
});
//Create Banner===
router.post("/banner", verifyTokenAndAdmin, async (req, res) => {
  const newBanner = new Banners(req.body);
  try {
    const savedBanner = await newBanner.save();
    res.status(200).json(savedBanner);
  } catch (error) {
    res.status(500).json(error);
  }
});
//Create Category===
router.post("/category", verifyTokenAndAdmin, async (req, res) => {
  const newCategory = new Categories(req.body);
  try {
    const savedCategory = await newCategory.save();
    res.status(200).json(savedCategory);
  } catch (error) {
    res.status(500).json(error);
  }
});
//Get All Banners===
router.get("/banners", async (req, res) => {
  try {
    const banners = await Banners.find();
    res.status(200).json(banners);
  } catch (error) {
    res.status(500).json(error);
  }
});
//Get All Categories===
router.get("/cats", async (req, res) => {
  try {
    const categories = await Categories.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json(error);
  }
});
//Delete Video===
router.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    await Video.findByIdAndDelete(req.params.id);
    res.status(200).json(`Video deleted successfully`);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Get Video===
router.get("/find/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    res.status(200).json(video);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Get All Videos===
router.get("/", async (req, res) => {
  try {
    const videos = await Video.find();
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json(error);
  }
});

//GET USER VIDEOS===
router.get(
  "/user-videos/:userId",
  verifyTokenAndAuthorization,
  async (req, res) => {
    try {
      const userVideos = await Video.find({ userId: req.params.userId });

      res.status(200).json(userVideos);
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

//Add Review===
router.post("/add-review", verifyToken, async (req, res) => {
  let { videoId, userId, review, commentator } = req.body;

  if (!videoId || !userId || !review) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await Video.updateOne(
      { _id: videoId },
      {
        $push: {
          reviews: { review, user: userId, commentator },
        },
      }
    );

    const commentedVideo = await Video.findById(videoId);
    return res.status(200).json(commentedVideo);
  } catch (error) {
    return res.status(500).json({ error: "error" });
  }
});

//ADD LIKES===
router.post("/add-like", verifyToken, async (req, res) => {
  let { likedUser, likedUsername, likedVideoId } = req.body;

  if (!likedUser || !likedUsername || !likedVideoId) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    await Video.updateOne(
      { _id: likedVideoId },
      {
        $push: {
          likes: { likedUser, likedUsername },
        },
      }
    );

    const likedVideo = await Video.findById(likedVideoId);
    return res.status(200).json(likedVideo);
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

//REMOVE LIKES ===
router.post("/remove-like", verifyToken, async (req, res) => {
  const { likedId, likedVideoId } = req.body;

  try {
    await Video.findByIdAndUpdate(likedVideoId, {
      $pull: { likes: { _id: likedId } },
    });

    const video = await Video.findById(likedVideoId);
    return res.status(200).json(video);
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

//ADD TO REPOST =====
router.post("/add-repost", verifyToken, async (req, res) => {
  let { repostedUser, repostedUsername, repostedVideoId } = req.body;

  if (!repostedUser || !repostedUsername || !repostedVideoId) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    await Video.updateOne(
      { _id: repostedVideoId },
      {
        $push: {
          reposts: { repostedUser, repostedUsername },
        },
      }
    );

    const repostedVideo = await Video.findById(repostedVideoId);
    return res.status(200).json(repostedVideo);
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

//REMOVE REPOST ====
router.post("/remove-repost", verifyToken, async (req, res) => {
  const { repostedId, repostedVideoId } = req.body;

  try {
    await Video.findByIdAndUpdate(repostedVideoId, {
      $pull: { reposts: { _id: repostedId } },
    });

    const video = await Video.findById(repostedVideoId);
    return res.status(200).json(video);
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

module.exports = router;
