const costPerKg = 0.2;

export function getCost(weight) {
  return weight * costPerKg;
}

export function getExpressCost(weight) {
  return weight * costPerKg * 2;
}

export function getCostWithDiscount(weight, discount) {
  return getCost(weight) - discount;
}

export function getExpressCostWithDiscount(weight, discount) {
  return getExpressCost(weight) - discount;
}
