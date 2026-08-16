import {
  stringify,
} from "csv-stringify/sync";

import {
  prisma,
} from "../../config/prisma";

export async function generateReportCsv(
  organizationId: string,
): Promise<string> {
  const records =
    await prisma.serviceCostSnapshot.findMany({
      where: {
        account: {
          organizationId,
        },
      },
      include: {
        account: true,
      },
      orderBy: {
        snapshotDate: "asc",
      },
    });

  return stringify(
    records.map(
      (record) => ({
        Date:
          record.snapshotDate
            .toISOString()
            .split("T")[0],

        Service:
          record.serviceName,

        Account:
          record.account.accountName,

        Cost:
          record.cost.toFixed(2),
      }),
    ),
    {
      header: true,
      columns: [
        "Date",
        "Service",
        "Account",
        "Cost",
      ],
    },
  );
}

export async function getReportNotes(
  organizationId: string,
) {
  return prisma.reportNote.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createReportNote(
  organizationId: string,
  title: string,
  content: string,
) {
  return prisma.reportNote.create({
    data: {
      organizationId,
      title,
      content,
    },
  });
}

export async function updateReportNote(
  organizationId: string,
  id: string,
  title: string,
  content: string,
) {
  const existing =
    await prisma.reportNote.findFirst({
      where: {
        id,
        organizationId,
      },
      select: {
        id: true,
      },
    });

  if (!existing) {
    return null;
  }

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
  organizationId: string,
  id: string,
) {
  const existing =
    await prisma.reportNote.findFirst({
      where: {
        id,
        organizationId,
      },
      select: {
        id: true,
      },
    });

  if (!existing) {
    return false;
  }

  await prisma.reportNote.delete({
    where: {
      id,
    },
  });

  return true;
}