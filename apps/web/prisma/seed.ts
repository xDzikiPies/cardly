import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const BACKGROUNDS = [
  { id: "bg_violet", name: "Violet", colorStart: "#6C5CE7", colorEnd: "#5B4CF0", textColor: "#FFFFFF", pattern: "none" },
  { id: "bg_midnight", name: "Midnight", colorStart: "#161A2B", colorEnd: "#2B2F4A", textColor: "#FFFFFF", pattern: "dots" },
  { id: "bg_sunset", name: "Sunset", colorStart: "#FF7A59", colorEnd: "#FFB199", textColor: "#1A1A1A", pattern: "waves" },
  { id: "bg_mint", name: "Mint", colorStart: "#1FD1A1", colorEnd: "#00B894", textColor: "#FFFFFF", pattern: "grid" },
  { id: "bg_paper", name: "Paper", colorStart: "#FFFFFF", colorEnd: "#F0F0F7", textColor: "#15142B", pattern: "none" },
  { id: "bg_ocean", name: "Ocean", colorStart: "#0F4C81", colorEnd: "#2E86AB", textColor: "#FFFFFF", pattern: "waves" },
  { id: "bg_rose", name: "Rose Gold", colorStart: "#F7B8B0", colorEnd: "#EAA2A2", textColor: "#3A1F1F", pattern: "none", isPremium: true },
  { id: "bg_graphite", name: "Graphite", colorStart: "#2D2D34", colorEnd: "#000000", textColor: "#FFFFFF", pattern: "grid", isPremium: true },
];

async function main() {
  for (const bg of BACKGROUNDS) {
    await prisma.cardBackground.upsert({ where: { id: bg.id }, update: bg, create: bg });
  }

  const passwordHash = await bcrypt.hash("cardly123", 10);
  const demoUser = await prisma.user.upsert({
    where: { email: "kamil.nowicki@cardly.app" },
    update: {},
    create: {
      email: "kamil.nowicki@cardly.app",
      passwordHash,
      firstName: "Kamil",
      lastName: "Nowicki",
      avatarUrl: "https://i.pravatar.cc/300?img=12",
    },
  });

  await prisma.businessCard.upsert({
    where: { id: "card_demo_1" },
    update: {},
    create: {
      id: "card_demo_1",
      userId: demoUser.id,
      firstName: "Kamil",
      lastName: "Nowicki",
      jobTitle: "Doradca finansowy",
      company: "Nowicki Finance",
      email: demoUser.email,
      phone: "+48 512 340 221",
      workAddress: "ul. Świdnicka 12, Wrocław",
      backgroundId: "bg_violet",
      isPrimary: true,
    },
  });

  const specialists = [
    { email: "anna.kowalska@demo.cardly.app", firstName: "Anna", lastName: "Kowalska", profession: "Radca prawny", bio: "Specjalizuję się w prawie nieruchomości i umowach najmu.", categories: ["Prawo", "Nieruchomości"], city: "Wrocław" },
    { email: "piotr.zielinski@demo.cardly.app", firstName: "Piotr", lastName: "Zieliński", profession: "Architekt wnętrz", bio: "Projektuję mieszkania i biura z naciskiem na minimalizm.", categories: ["Architektura", "Design"], city: "Wrocław" },
    { email: "magdalena.wojcik@demo.cardly.app", firstName: "Magdalena", lastName: "Wójcik", profession: "Fizjoterapeutka", bio: "Terapia manualna, rehabilitacja sportowa.", categories: ["Zdrowie"], city: "Wrocław" },
  ];

  for (const s of specialists) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: { email: s.email, passwordHash, firstName: s.firstName, lastName: s.lastName },
    });

    const specialistProfile = await prisma.specialistProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        profession: s.profession,
        bio: s.bio,
        categories: s.categories,
        city: s.city,
        latitude: 51.1079,
        longitude: 17.0385,
        ratingAvg: 4.8,
        ratingCount: 12,
        isPublished: true,
      },
    });

    const existingServices = await prisma.serviceOffering.count({
      where: { specialistProfileId: specialistProfile.id },
    });
    if (existingServices === 0) {
      await prisma.serviceOffering.createMany({
        data: [
          { specialistProfileId: specialistProfile.id, name: "Konsultacja wstępna", price: 0, priceUnit: "spotkanie" },
          { specialistProfileId: specialistProfile.id, name: `Pełna usługa — ${s.profession.toLowerCase()}`, price: null },
        ],
      });
    }
  }

  console.log("Seed OK — konto testowe: kamil.nowicki@cardly.app / cardly123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
