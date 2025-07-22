// src/services/mechanicService.ts
import api from "@/lib/axios";

export type Mechanic = {
  id: string;
  name: string;
  specialty: string;
};

// GET all mechanics
// export const getMechanics = async (): Promise<Mechanic[]> => {
//   const response = await api.get("/mechanics");
//   return response.data;
// };

export const getMechanics = async () => {
  const res = await api.get("/mechanics");
  return res.data.map((m: any) => ({
    id: m._id,
    name: m.name,
    specialty: m.specialty,
  }));
};

// POST a new mechanic
export const addMechanic = async (
  mechanic: Omit<Mechanic, "id">
): Promise<Mechanic> => {
  const response = await api.post("/mechanics/create", mechanic);
  return response.data;
};

// DELETE mechanic by ID
export const deleteMechanic = async (id: string) => {
  if (!id) throw new Error("Invalid mechanic ID");

  return api.delete(`/mechanics/delete/${id}`);
};

// PUT (update) mechanic
export const updateMechanic = async (
  id: string,
  updatedData: Partial<Mechanic>
): Promise<Mechanic> => {
  const response = await api.put(`/mechanics/update/${id}`, updatedData);
  return response.data;
};
