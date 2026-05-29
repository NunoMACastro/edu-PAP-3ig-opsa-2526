import prisma from "./prisma.js";

// LISTAR
export async function getWarehouses() {
  return prisma.warehouse.findMany({
    include: { locations: true },
  });
}

// CRIAR WAREHOUSE
export async function createWarehouse(data) {
  return prisma.warehouse.create({
    data,
  });
}

// CRIAR LOCATION
export async function createLocation(warehouseId, data) {
  // verificar se warehouse existe
  const warehouse = await prisma.warehouse.findUnique({
    where: { id: warehouseId },
    include: { locations: true },
  });

  if (!warehouse) {
    throw new Error("WAREHOUSE_NOT_FOUND");
  }

  // regra duplicação
  const exists = warehouse.locations.find(
    (l) => l.code === data.code
  );

  if (exists) {
    throw new Error("LOCATION_ALREADY_EXISTS");
  }

  return prisma.location.create({
    data: {
      code: data.code,
      warehouseId,
    },
  });
}