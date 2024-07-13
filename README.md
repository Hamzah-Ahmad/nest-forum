
# Description

This NestJS application was built to familiarize myself with the library. It includes a post and comment system with infinitely nested replies, and an image upload functionality using a BullMQ queue to delegate the image upload process. Image uploads can be handled via Google Cloud Storage or UploadCare, with the strategy pattern implemented to easily switch between the two services.

## Technologies used:

- NestJS
- TypeORM
- Docker
- BullMQ
- Google Cloud Storage
- Jest
- Supertest

## Steps To Get Started:

- Create a `.env` file. The values needed are mentioned in the `.env.test` file

- Make sure to have Docker installed and running

- Install dependencies:

    `npm install`

- Start the applicaiton:

    `npm run start:dev`
