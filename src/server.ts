import mongoose from "mongoose";
import config from "./app/config";
import app from "./app";

const server = async () => {
  try {
    await mongoose.connect(config.database_url as string);

    app.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on port ${config.port} 🏃‍♂️`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

server();
