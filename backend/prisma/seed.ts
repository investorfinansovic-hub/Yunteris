import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const services = [
    {
      code: 'SUPPORT',
      name: 'Поддерживающая уборка',
      basePrice: 1900,
      description: 'Полы, пыль, кухня, санузлы — регулярная свежесть для жизни.',
    },
    {
      code: 'GENERAL',
      name: 'Генеральная уборка',
      basePrice: 3400,
      description: 'Глубокая чистка всех зон, включая труднодоступные места.',
    },
    {
      code: 'POST_RENOVATION',
      name: 'Уборка после ремонта',
      basePrice: 4900,
      description: 'Строительная пыль, следы краски и скотча, мойка окон.',
    },
    {
      code: 'MOVING',
      name: 'Уборка при переезде',
      basePrice: 3900,
      description: 'Подготовим квартиру к сдаче или заезду «под ключ».',
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { code: service.code },
      update: service,
      create: service,
    });
  }

  const options = [
    { code: 'windows', name: 'Мытьё окон изнутри', price: 800 },
    { code: 'oven', name: 'Духовка', price: 500 },
    { code: 'fridge', name: 'Холодильник', price: 500 },
    { code: 'balcony', name: 'Балкон', price: 700 },
    { code: 'ironing', name: 'Глажка белья', price: 600 },
  ];

  for (const option of options) {
    await prisma.serviceOption.upsert({
      where: { code: option.code },
      update: option,
      create: option,
    });
  }

  // eslint-disable-next-line no-console
  console.log('Seed complete: services and options loaded.');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
