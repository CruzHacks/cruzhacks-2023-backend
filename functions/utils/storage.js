const { storage } = require("./admin");
const uploadFile = (bucketName, filename, file) => {
  const bucket = storage.bucket(bucketName);
  return bucket.upload(file.path, {
    destination: filename,
  });
};
module.exports = { uploadFile };
