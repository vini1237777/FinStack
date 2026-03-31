import prisma from "../../config/database";

export const itemService = {
  async create(data: {
    name: string;
    description?: string;
    hsnCode: string;
    categoryId: string;
    unit: string;
    costPrice: number;
    sellingPrice: number;
  }) {
    return prisma.item.create({ data, include: { category: true } });
  },

  async getAll() {
    return prisma.item.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string) {
    const item = await prisma.item.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!item) throw new Error("Item not found");
    return item;
  },

  async update(id: string, data: any) {
    return prisma.item.update({
      where: { id },
      data,
      include: { category: true },
    });
  },

  async delete(id: string) {
    return prisma.item.delete({ where: { id } });
  },
};
