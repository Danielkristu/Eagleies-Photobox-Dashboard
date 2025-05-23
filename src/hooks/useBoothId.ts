export const getBoothId = () => {
  return localStorage.getItem("booth_id");
};


export const setBoothId = (id: string) => {
  localStorage.setItem("booth_id", id);
};

export const clearBoothId = () => {
  localStorage.removeItem("booth_id");
};

