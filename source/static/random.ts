export const randomId = (): string => Math.random().toString(16).slice(2);

export const randomizedApplicationId = () => randomId().slice(0, 3);
