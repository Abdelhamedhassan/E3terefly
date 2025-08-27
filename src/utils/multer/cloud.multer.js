import multer from "multer";

export const fileValidation = {
  image: ["image/jpeg", "image/gif", "image/png"],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

export const cloudFileUpload = ({ validation = [] } = {}) => {
  const storage = multer.diskStorage({});
  const fileFilter = function (req, file, callback) {
    if (validation.includes(file.mimetype)) {
      return callback(null, true);
    }
    return callback("invalid File Type", false);
  };

  return multer({
    fileFilter,
    storage,
  });
};
