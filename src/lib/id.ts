let counter = 1000;

export function createId(prefix = 'id'): string {
  counter += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${counter}_${rand}`;
}
