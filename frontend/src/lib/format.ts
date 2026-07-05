const currencyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
});

export function formatPrice(value: number) {
  return currencyFormat.format(value);
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
