import multer from "multer";

const uploadPath = "./tmp/uploads";

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split(".");
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + ext[1]);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format." }, false);
  }
};

export const uploadImage = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fieldSize: 2000000 },
});

export const uploadFile = multer({
  storage: multerStorage,
  limits: { fieldSize: 2000000 },
});
