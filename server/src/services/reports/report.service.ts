import { PrismaClient } from "@prisma/client";
import { stringify } from "csv-stringify/sync";

const prisma = new PrismaClient();

export async function generateReportCsv(): Promise<string> {
  const records = await prisma.costRecord.findMany({
    include: {
      service: true,
    },
    orderBy: {
      usageDate: "asc",
    },
  });

  return stringify(
    records.map((record) => ({
      Date: record.usageDate.toISOString().split("T")[0],
      Service: record.service.name,
      Cost: record.cost.toFixed(2),
    })),
    {
      header: true,
      columns: [
        "Date",
        "Service",
        "Cost",
      ],
    }
  );
}

export async function getReportNotes() {
  return prisma.reportNote.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createReportNote(
  title: string,
  content: string
) {
  return prisma.reportNote.create({
    data: {
      title,
      content,
    },
  });
}

export async function updateReportNote(
  id: string,
  title: string,
  content: string
) {
  return prisma.reportNote.update({
    where: {
      id,
    },
    data: {
      title,
      content,
    },
  });
}

export async function deleteReportNote(
  id: string
) {
  return prisma.reportNote.delete({
    where: {
      id,
    },
  });
}