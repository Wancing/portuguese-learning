import { drizzle } from "drizzle-orm/mysql2";
import { categories, phrases } from "./drizzle/schema.js";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

const sampleCategories = [
  {
    name: "Saudações",
    nameEn: "Greetings",
    description: "Essential greetings and introductions for daily interactions",
    icon: "👋",
  },
  {
    name: "Compras",
    nameEn: "Shopping",
    description: "Useful phrases for shopping and making purchases",
    icon: "🛍️",
  },
  {
    name: "Restaurante",
    nameEn: "Dining",
    description: "Order food and drinks with confidence",
    icon: "🍽️",
  },
  {
    name: "Viagem",
    nameEn: "Travel",
    description: "Navigate transportation and ask for directions",
    icon: "✈️",
  },
  {
    name: "Emergência",
    nameEn: "Emergency",
    description: "Important phrases for urgent situations",
    icon: "🚨",
  },
];

const samplePhrases = [
  // Greetings (categoryId: 1)
  {
    categoryId: 1,
    textPt: "Bom dia!",
    textEn: "Good morning!",
    audioUrl: "https://example.com/audio/bom-dia.mp3",
    audioKey: "native/bom-dia.mp3",
    difficulty: "beginner",
  },
  {
    categoryId: 1,
    textPt: "Como está?",
    textEn: "How are you?",
    audioUrl: "https://example.com/audio/como-esta.mp3",
    audioKey: "native/como-esta.mp3",
    difficulty: "beginner",
  },
  {
    categoryId: 1,
    textPt: "Muito prazer!",
    textEn: "Nice to meet you!",
    audioUrl: "https://example.com/audio/muito-prazer.mp3",
    audioKey: "native/muito-prazer.mp3",
    difficulty: "beginner",
  },
  {
    categoryId: 1,
    textPt: "Até logo!",
    textEn: "See you later!",
    audioUrl: "https://example.com/audio/ate-logo.mp3",
    audioKey: "native/ate-logo.mp3",
    difficulty: "beginner",
  },
  // Shopping (categoryId: 2)
  {
    categoryId: 2,
    textPt: "Quanto custa?",
    textEn: "How much does it cost?",
    audioUrl: "https://example.com/audio/quanto-custa.mp3",
    audioKey: "native/quanto-custa.mp3",
    difficulty: "beginner",
  },
  {
    categoryId: 2,
    textPt: "Posso experimentar?",
    textEn: "Can I try it on?",
    audioUrl: "https://example.com/audio/posso-experimentar.mp3",
    audioKey: "native/posso-experimentar.mp3",
    difficulty: "intermediate",
  },
  {
    categoryId: 2,
    textPt: "Aceita cartão?",
    textEn: "Do you accept cards?",
    audioUrl: "https://example.com/audio/aceita-cartao.mp3",
    audioKey: "native/aceita-cartao.mp3",
    difficulty: "beginner",
  },
  // Dining (categoryId: 3)
  {
    categoryId: 3,
    textPt: "Uma mesa para dois, por favor.",
    textEn: "A table for two, please.",
    audioUrl: "https://example.com/audio/mesa-dois.mp3",
    audioKey: "native/mesa-dois.mp3",
    difficulty: "intermediate",
  },
  {
    categoryId: 3,
    textPt: "A conta, por favor.",
    textEn: "The bill, please.",
    audioUrl: "https://example.com/audio/a-conta.mp3",
    audioKey: "native/a-conta.mp3",
    difficulty: "beginner",
  },
  {
    categoryId: 3,
    textPt: "Está delicioso!",
    textEn: "It's delicious!",
    audioUrl: "https://example.com/audio/delicioso.mp3",
    audioKey: "native/delicioso.mp3",
    difficulty: "beginner",
  },
  // Travel (categoryId: 4)
  {
    categoryId: 4,
    textPt: "Onde fica a estação?",
    textEn: "Where is the station?",
    audioUrl: "https://example.com/audio/onde-estacao.mp3",
    audioKey: "native/onde-estacao.mp3",
    difficulty: "intermediate",
  },
  {
    categoryId: 4,
    textPt: "Um bilhete para Lisboa, por favor.",
    textEn: "A ticket to Lisbon, please.",
    audioUrl: "https://example.com/audio/bilhete-lisboa.mp3",
    audioKey: "native/bilhete-lisboa.mp3",
    difficulty: "intermediate",
  },
  {
    categoryId: 4,
    textPt: "Estou perdido.",
    textEn: "I'm lost.",
    audioUrl: "https://example.com/audio/estou-perdido.mp3",
    audioKey: "native/estou-perdido.mp3",
    difficulty: "beginner",
  },
  // Emergency (categoryId: 5)
  {
    categoryId: 5,
    textPt: "Preciso de ajuda!",
    textEn: "I need help!",
    audioUrl: "https://example.com/audio/preciso-ajuda.mp3",
    audioKey: "native/preciso-ajuda.mp3",
    difficulty: "beginner",
  },
  {
    categoryId: 5,
    textPt: "Chame uma ambulância!",
    textEn: "Call an ambulance!",
    audioUrl: "https://example.com/audio/ambulancia.mp3",
    audioKey: "native/ambulancia.mp3",
    difficulty: "intermediate",
  },
  {
    categoryId: 5,
    textPt: "Onde é o hospital?",
    textEn: "Where is the hospital?",
    audioUrl: "https://example.com/audio/onde-hospital.mp3",
    audioKey: "native/onde-hospital.mp3",
    difficulty: "beginner",
  },
];

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    // Insert categories
    console.log("📁 Inserting categories...");
    await db.insert(categories).values(sampleCategories);
    console.log(`✅ Inserted ${sampleCategories.length} categories`);

    // Insert phrases
    console.log("💬 Inserting phrases...");
    await db.insert(phrases).values(samplePhrases);
    console.log(`✅ Inserted ${samplePhrases.length} phrases`);

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
