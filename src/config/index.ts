export default () => ({
  environment: process.env.NODE_ENV || `development`,
  secret: {
    ACCESS_TOKEN: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN: process.env.REFRESH_TOKEN_SECRET,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  },
  gcp: {
    projectId: process.env.GCP_PROJECT_ID,
    clientEmail: process.env.GCP_CLIENT_EMAIL,
    privateKey: process.env.GCP_PRIVATE_KEY
      ? process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n')
      : ``,
    buckets: {
      images: process.env.GCP_IMAGES_BUKCET,
    },
  },
  upload_care: {
    apiKey: process.env.UPLOAD_CARE_API_KEY,
  },
});
