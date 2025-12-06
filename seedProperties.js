import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { PlotModel, HouseModel, CommercialPlotModel } from "./src/models/property.js"; // adjust path if needed

// --------------------- CONFIG ---------------------
const MONGO_URI = "mongodb://localhost:27017/deal-karo"; // change if needed
const TOTAL_RECORDS = 100; // 0.1 million
const BATCH_SIZE = 5000;
const START_NUMBER = 10000;

const PHASE = "Phase 7";

const LISTING_TYPES = ["cash", "rent", "installments"];
const AREAS = ["5 Marla", "10 Marla", "1 Kanal", "2 Kanal"];
const FEATURES = [
  "Corner",
  "Park Facing",
  "Near Masjid",
  "Main Boulevard",
  "Possession Available"
];

const RESIDENTIAL_BLOCKS = [
  "A block", "A-ext block", "B block", "C block", "C-ext block",
  "D block", "D-ext block", "E block", "F block", "G block", "H block",
  "I block", "J block", "J-ext block", "J-1 block", "K block", "L block",
  "M block", "O block", "P block", "Q block", "R block", "R-ext block",
  "Overseas Zone 1", "Overseas Zone 2", "Overseas Zone 3",
  "Overseas Zone 4", "Overseas Zone 5"
];

const COMMERCIAL_BLOCKS = [
  "A block Market", "A2 Commercial", "B block market", "C block market", "C2 commercial",
  "D block commercial", "F block commercial", "F block D-shape commercial", "I block commercial",
  "J block commercial", "J-1 block commercial", "L block commercial", "L block D-shape commercial",
  "M block commercial", "N block commercial", "N-ext block commercial", "O block commercial",
  "P commercial zone", "P commercial shop", "R commercial", "R1 commercial", "R2 commercial",
  "R-ext commercial", "Overseas commercial zone 1", "Overseas commercial zone 2",
  "Overseas commercial zone 3", "Overseas commercial zone 4", "Overseas commercial zone 5"
];

// --------------------- CONNECTION ---------------------
await mongoose.connect(MONGO_URI);
console.log("✅ Connected to MongoDB");

// --------------------- GENERATION LOGIC ---------------------
function generateProperty(propertyType, indexOffset) {
  const base = {
    userId: new mongoose.Types.ObjectId(),
    propertyType,
    listingType: faker.helpers.arrayElement(LISTING_TYPES),
    phase: PHASE,
    area: faker.helpers.arrayElement(AREAS),
    additionalArea: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 4 }) + " Marla"),
    price: faker.number.int({ min: 1000000, max: 50000000 }),
    description: faker.lorem.sentences(3),
    features: faker.helpers.arrayElements(FEATURES, faker.number.int({ min: 1, max: 3 })),
    forContact: faker.phone.number("+92##########"),
  };

  const number = START_NUMBER + indexOffset;

  if (propertyType === "plot") {
    return {
      ...base,
      block: faker.helpers.arrayElement(RESIDENTIAL_BLOCKS),
      plotNo: number,
      pricePerMarla: faker.number.int({ min: 100000, max: 500000 }),
      installment: {
        perMonth: faker.number.int({ min: 20000, max: 150000 }),
        halfYearly: faker.number.int({ min: 60000, max: 300000 }),
      },
    };
  }

  if (propertyType === "house") {
    return {
      ...base,
      block: faker.helpers.arrayElement(RESIDENTIAL_BLOCKS),
      houseNo: number,
      installment: {
        perMonth: faker.number.int({ min: 30000, max: 200000 }),
        halfYearly: faker.number.int({ min: 90000, max: 600000 }),
      },
    };
  }

  if (propertyType === "commercial plot") {
    return {
      ...base,
      block: faker.helpers.arrayElement(COMMERCIAL_BLOCKS),
      plotNo: number,
      pricePerMarla: faker.number.int({ min: 150000, max: 800000 }),
      installment: {
        perMonth: faker.number.int({ min: 40000, max: 250000 }),
        halfYearly: faker.number.int({ min: 120000, max: 800000 }),
      },
    };
  }
}

// --------------------- SEED FUNCTION ---------------------
async function seedData() {
  console.log(`🌱 Starting to seed ${TOTAL_RECORDS.toLocaleString()} records...`);

  const perType = Math.floor(TOTAL_RECORDS / 3);
  let inserted = 0;

  const typeConfigs = [
    { name: "plot", model: PlotModel },
    { name: "house", model: HouseModel },
    { name: "commercial plot", model: CommercialPlotModel },
  ];

  for (const { name, model } of typeConfigs) {
    console.log(`\n🧩 Seeding ${name}s...`);
    for (let batch = 0; batch < perType / BATCH_SIZE; batch++) {
      const docs = [];
      for (let i = 0; i < BATCH_SIZE; i++) {
        const globalIndex = batch * BATCH_SIZE + i;
        docs.push(generateProperty(name, globalIndex));
      }

      await model.insertMany(docs);
      inserted += docs.length;
      console.log(`✅ Inserted ${inserted.toLocaleString()} / ${TOTAL_RECORDS.toLocaleString()} total`);
    }
  }

  console.log("🎉 Seeding complete!");
  await mongoose.disconnect();
}

seedData().catch((err) => {
  console.error("❌ Error during seeding:", err);
  mongoose.disconnect();
});
