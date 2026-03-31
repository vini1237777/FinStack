import prisma from "../../config/database";

export const inventoryService = {
  async stockIn(data: {
    itemId: string;
    warehouseId: string;
    quantity: number;
    referenceType: string;
    referenceId: string;
    date: Date;
  }) {
    return prisma.stockMovement.create({
      data: {
        itemId: data.itemId,
        warehouseId: data.warehouseId,
        movementType: "IN",
        quantity: data.quantity,
        referenceType: data.referenceType,
        referenceId: data.referenceId,
        date: data.date,
      },
    });
  },

  async stockOut(data: {
    itemId: string;
    warehouseId: string;
    quantity: number;
    referenceType: string;
    referenceId: string;
    date: Date;
  }) {
    const available = await this.getStockLevel(data.itemId, data.warehouseId);
    if (available < data.quantity) {
      throw new Error(
        `Insufficient stock. Available: ${available}, Requested: ${data.quantity}`,
      );
    }

    return prisma.stockMovement.create({
      data: {
        itemId: data.itemId,
        warehouseId: data.warehouseId,
        movementType: "OUT",
        quantity: data.quantity,
        referenceType: data.referenceType,
        referenceId: data.referenceId,
        date: data.date,
      },
    });
  },

  async getStockLevel(itemId: string, warehouseId: string): Promise<number> {
    const movements = await prisma.stockMovement.findMany({
      where: { itemId, warehouseId },
    });

    return movements.reduce((total, m) => {
      return m.movementType === "IN" ? total + m.quantity : total - m.quantity;
    }, 0);
  },

  async getStockSummary() {
    const movements = await prisma.stockMovement.findMany({
      include: { item: true, warehouse: true },
    });

    const summary: Record<
      string,
      { item: any; warehouse: any; quantity: number }
    > = {};

    for (const m of movements) {
      const key = `${m.itemId}-${m.warehouseId}`;
      if (!summary[key]) {
        summary[key] = { item: m.item, warehouse: m.warehouse, quantity: 0 };
      }
      summary[key].quantity +=
        m.movementType === "IN" ? m.quantity : -m.quantity;
    }

    return Object.values(summary);
  },
};
