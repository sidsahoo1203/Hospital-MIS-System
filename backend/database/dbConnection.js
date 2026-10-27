import mongoose from "mongoose";
import { readFile } from "fs/promises";
import { Medicine } from "../models/medicineSchema.js";

// Fills an empty medicine inventory from data/medicines.json (first run only)
const seedMedicines = async () => {
  if (await Medicine.estimatedDocumentCount()) return;
  const file = new URL("../data/medicines.json", import.meta.url);
  const medicines = JSON.parse(await readFile(file, "utf8"));
  await Medicine.insertMany(medicines);
  console.log(`Seeded ${medicines.length} medicines into the store inventory`);
};

const dbConnection = async () => {

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Database connected successfully');
        await seedMedicines();
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
};

export default dbConnection;
