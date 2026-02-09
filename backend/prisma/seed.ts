import { PrismaClient, PaymentMethodType, Recurrence } from '@prisma/client'
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

    // Create Users
    const user1 = await prisma.user.create({
        data: {
            name: 'Mateus Paiva',
            email: 'mateus@example.com',
            passwordHash,
        },
    })
    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
