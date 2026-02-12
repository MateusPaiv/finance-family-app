/// <reference types="node" />
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    // Cleanup existing data
    await prisma.sharedExpense.deleteMany()
    await prisma.expense.deleteMany()
    await prisma.fixedBill.deleteMany()
    await prisma.category.deleteMany()
    await prisma.paymentMethod.deleteMany()
    await prisma.user.deleteMany()

    const passwordHash = await bcrypt.hash('lumy3099', 10)

    const mateus = await prisma.user.create({
        data: {
            name: 'Mateus Paiva',
            email: 'mateus@example.com',
            passwordHash,
        },
    })
    console.log(`✓ Created user: ${mateus.name}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
