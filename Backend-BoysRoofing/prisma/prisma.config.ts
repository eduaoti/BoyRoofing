import "dotenv/config";

export default {
  datasource: {
    db: {
      url: process.env.DATABASE_URL!,
    },
  },
};
