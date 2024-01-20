var express = require("express");
var router = express.Router();
var userModel = require("./users");
var postModel = require("./posts");
const passport = require("passport");
const localStrategy = require("passport-local");
const upload = require("./multer");

passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index");
});
router.get("/profile", isLoggedIn, async function (req, res) {
  const user = await userModel
    .findOne({
      username: req.session.passport.user,
    })
    .populate("posts");
  
  res.render("profile", { user });
});
router.get("/login", function (req, res) {
  res.render("login", { error: req.flash("error") });
});

router.get("/feed", isLoggedIn, async function (req, res) {
   
   const user= await userModel.find({username:req.session.passport.user})
   const posts= await postModel.find()
   .populate('user')

   res.render("feed",{user,posts});
});

router.post("/upload", upload.single("file"), async function (req, res) {
  if (!req.file) {
    return res.status(404).send("No file uploaded found");
  }
  const user = await userModel.findOne({ username: req.session.passport.user });
  const post = await postModel.create({
    imageText: req.body.imageText,
    images: req.file.filename,
    user: user._id,
  });
  user.posts.push(post._id);
  
  await user.save();
  res.redirect("/profile");
});

router.post("/register", function (req, res) {
  const { username, email, fullname } = req.body;

  var userdata = new userModel({
    username,
    email,
    fullname,
  });

  userModel.register(userdata, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (req, res) {}
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}
module.exports = router;

// router.get("/alluserpost", async function (req, res) {

//   let user= await userModel.findOne({_id:"6587175fd5152e352afce452"}).populate('posts');
//   res.send(user);
// });
// router.get("/createpost", async function (req, res) {
//   let createdpost = await postModel.create({
//     postText: "Hello deepak",
//     user: "6587175fd5152e352afce452",
//   });
//   let user = await userModel.findOne({ _id: "6587175fd5152e352afce452" });
//   console.log(user);
//   user.posts.push(createdpost._id);
//   await user.save();
//   res.send("done post created");
// });
