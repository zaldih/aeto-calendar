export const ADD_HOURS = (date: Date, hours: number) =>
  new Date(new Date(date).setHours(date.getHours() + hours));
