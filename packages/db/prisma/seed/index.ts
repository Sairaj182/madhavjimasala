import { PrismaClient } from '@prisma/client'
import { PRODUCTS } from './constants'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create categories
  const spicesCategory = await prisma.category.upsert({
    where: { slug: 'spices' },
    update: {},
    create: {
      name: 'Spices',
      slug: 'spices',
      description: 'Premium quality ground spices',
    },
  })

  // Create products
  const products = PRODUCTS;

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        // The legacy catalogue price is expressed in rupees; keep the new
        // canonical money field in paise for server-side order calculations.
        priceInPaise: product.price * 100,
        allowLooseQuantity: false,
        loosePricingRules: [],
        isGeneralStore: false,
      },
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
