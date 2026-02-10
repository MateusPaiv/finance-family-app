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

    const passwordHash = await bcrypt.hash('123456', 10)

    // Create Family Users
    const mateus = await prisma.user.create({
        data: {
            name: 'Mateus Paiva',
            email: 'mateus@example.com',
            passwordHash,
        },
    })
    console.log(`✓ Created user: ${mateus.name}`)

    const sister = await prisma.user.create({
        data: {
            name: 'Sister',
            email: 'sister@example.com',
            passwordHash,
        },
    })
    console.log(`✓ Created user: ${sister.name}`)

    const dad = await prisma.user.create({
        data: {
            name: 'Dad',
            email: 'dad@example.com',
            passwordHash,
        },
    })
    console.log(`✓ Created user: ${dad.name}`)

    const mom = await prisma.user.create({
        data: {
            name: 'Mom',
            email: 'mom@example.com',
            passwordHash,
        },
    })
    console.log(`✓ Created user: ${mom.name}`)

    console.log('\n🎉 Seeding finished!')
    console.log('\nFamily accounts created (all passwords: 123456):')
    console.log('  - mateus@example.com')
    console.log('  - sister@example.com')
    console.log('  - dad@example.com')
    console.log('  - mom@example.com')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
