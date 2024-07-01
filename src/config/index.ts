export default () => ({
  environment: process.env.NODE_ENV || `development`,
  secret: {
    'ACCESS_TOKEN': process.env.ACCESS_TOKEN_SECRET,
    'REFRESH_TOKEN': process.env.REFRESH_TOKEN_SECRET,
  }
});
