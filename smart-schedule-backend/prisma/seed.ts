import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const professional = await prisma.professional.upsert({
    where: { email: 'contato@barberking.com' },
    update: {},
    create: {
      name: 'Mestre da Navalha',
      email: 'contato@barberking.com',
      phone: '5511999999999',
    },
  })

  await prisma.service.createMany({
    data: [
      {
        name: 'Corte Degradê',
        description: 'Corte moderno com acabamento na navalha',
        price: 45.00,
        durationMinutes: 45,
        professionalId: professional.id,
      },
      {
        name: 'Barba Terapia',
        description: 'Modelagem de barba com toalha quente',
        price: 35.00,
        durationMinutes: 30,
        professionalId: professional.id,
      },
      {
        name: 'Combo Completo',
        description: 'Corte + Barba + Sobrancelha',
        price: 75.00,
        durationMinutes: 60,
        professionalId: professional.id,
      },
    ],
    skipDuplicates: true, 
  })

  console.log('Database seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })