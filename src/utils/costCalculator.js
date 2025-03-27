const costPerKg = 1000; //naira

export function getCost(weight) {
  weight = [...weight.toString()];
  return Number(weight[0]) * costPerKg;
}

export function getExpressCost(weight) {
  weight = [...weight.toString()];
  return Number(weight[0]) * costPerKg * 2;
}

export function getCostWithDiscount(weight, discount) {
  return percentageDiscount(getCost(weight), discount);
}

export function getExpressCostWithDiscount(weight, discount) {
  return percentageDiscount(getExpressCost(weight), discount);
}

export function percentageDiscount(cost, discount) {
  let discountamount = (discount / 100) * cost;
  let total = cost - discountamount;
  return total;
}
