export function generateId(): string {
  return (Math.floor(Math.random() * 1000000000)).toString();
}
