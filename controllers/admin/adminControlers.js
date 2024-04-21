const cloudinary = require("../../cloudinary/cloudinary");
const adminDb = require("../../model/admin/adminModal");
const bcrypt = require("bcrypt");
const fs =require("fs")
///register controller

exports.Register = async (req, res) => {
  const { profile, name, email, password, confirmPassword, mobile } = req.body;

  if (
    !name ||
    !email ||
    !mobile ||
    !password ||
    !confirmPassword ||
    !req.file
  ) {
    res.status(400).json({ error: "all fields are required" });
  }
  const file = req.file?.path;

  const upload = await cloudinary.uploader.upload(file);
  

  try {
    const exsitUser = await adminDb.findOne({ email: email });
    const mobileAuth = await adminDb.findOne({ mobile: mobile });
    
    if (exsitUser) {
      const filename = req.file.filename;
      const filepath = `adminuploads/${filename}`
      fs.unlink(filepath, (err)=>{
          res.end(err)
        });
      res.status(400).json({ error: "Admin Already Exist" });
    } else if (mobileAuth) {
      res.status(400).json({ error: "This Number Already Exist" });
    } else if (password !== confirmPassword) {
      res
        .status(400)
        .json({ error: "password and confirmpassword not matched" });
    } else {
      const adminData = new adminDb({
        name,
        email,
        mobile,
        password,
        profile: upload.secure_url,
      });
      await adminData.save();
      res.status(200).json(adminData);
    }
  } catch (error) {
    res.status(400).json(error);
  }
};
//Login Controler
exports.Login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      error: "all field required",
    });
  }
  try {
    const adminValidation = await adminDb.findOne({ email: email });

    if (adminValidation) {
      const isMatch = await bcrypt.compare(password, adminValidation.password);
      if (!isMatch) {
        res.status(400).json({ error: "invalid Details" });
      } else {
        //TOKEN GENARATE
        const token = await adminValidation.generateAuthToken();
        const result = {
          adminValidation,
          token,
        };

        res.status(200).json(result);
      }
    } else {
      res.status(400).json({ error: "Invalid details" });
    }
  } catch (error) {
    res.status(400).json(error);
  }
};

///admin verify
exports.Adminverify = async (req, res) => {
  try {
    const verifyAdmin = await adminDb.findOne({ _id: req.userId });
    res.status(200).json(verifyAdmin);
  } catch (error) {
    res.status(400).json({ error: "invalid details" });
  }
};

///Admin Logout Controller

exports.Logout = async (req, res) => {
  try {
    req.rootUser.tokens = req.rootUser.tokens.filter((el) => {
      return el.token !== req.token;
    });
    req.rootUser.save();
    res.status(200).json({ message: "User successfully Logout" });
  } catch (error) {
    res.status(400).json(error);
  }
};
