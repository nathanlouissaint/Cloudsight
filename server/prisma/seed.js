import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const SERVICE_PROFILES = {
    EC2: {
        base: 42,
        variance: 18,
    },
    S3: {
        base: 8,
        variance: 4,
    },
    RDS: {
        base: 28,
        variance: 10,
    },
    Lambda: {
        base: 5,
        variance: 3,
    },
    CloudFront: {
        base: 11,
        variance: 5,
    },
    ECS: {
        base: 22,
        variance: 8,
    },
    EKS: {
        base: 35,
        variance: 12,
    },
    Route53: {
        base: 2,
        variance: 1,
    },
};
function generateCost(base, variance) {
    const fluctuation = (Math.random() - 0.5) * variance;
    return Number(Math.max(base + fluctuation, 0.5).toFixed(2));
}
async function main() {
    console.log("Cleaning existing records...");
    await prisma.costRecord.deleteMany();
    console.log("Loading services...");
    const services = await prisma.cloudService.findMany();
    if (services.length !== 8) {
        throw new Error(`Expected 8 cloud services, found ${services.length}`);
    }
    console.log("Generating cost history...");
    const records = [];
    for (let dayOffset = 89; dayOffset >= 0; dayOffset--) {
        const usageDate = new Date();
        usageDate.setDate(usageDate.getDate() - dayOffset);
        usageDate.setHours(0, 0, 0, 0);
        for (const service of services) {
            const profile = SERVICE_PROFILES[service.name];
            if (!profile) {
                throw new Error(`Missing profile for service: ${service.name}`);
            }
            records.push({
                serviceId: service.id,
                usageDate,
                cost: generateCost(profile.base, profile.variance),
            });
        }
    }
    await prisma.costRecord.createMany({
        data: records,
    });
    console.log(`Created ${records.length} cost records`);
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map