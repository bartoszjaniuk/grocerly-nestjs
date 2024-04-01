import { GroceryCategory, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIES: GroceryCategory[] = [
  {
    id: '1',
    name: 'Owoce',
  },
  {
    id: '2',
    name: 'Warzywa',
  },
  {
    id: '3',
    name: 'Pieczywo',
  },
  {
    id: '4',
    name: 'Słodycze',
  },
  {
    id: '5',
    name: 'Produkty mleczne',
  },
  {
    id: '6',
    name: 'Chemia',
  },
  {
    id: '7',
    name: 'Alkohol',
  },
  {
    id: '8',
    name: 'Przekąski',
  },
  {
    id: '9',
    name: 'Przyprawy',
  },
  {
    id: '10',
    name: 'Inne',
  },
];

const main = async () =>
  await prisma.groceryCategory.createMany({ data: CATEGORIES });

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
