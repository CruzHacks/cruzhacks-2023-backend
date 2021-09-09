const uploadFile = (storage, bucketName, filename, file) => {
  const bucket = storage.bucket(bucketName);
  return bucket.upload(file.path, {
    destination: filename,
  });
};
module.exports = { uploadFile };
