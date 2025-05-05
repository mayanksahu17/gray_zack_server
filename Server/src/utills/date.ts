export const normalizeStartDate = (date?: string) => {
    const d = date ? new Date(date) : new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  };
  
  export const normalizeEndDate = (date?: string) => {
    const d = date ? new Date(date) : new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  };
  