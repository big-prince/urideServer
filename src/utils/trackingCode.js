import { v4 as uuidv4 } from "uuid";

const substring = "pdt-";
export function generateTrackingCode() {
  let code = uuidv4().substring(0, 20);
  return `${substring}${code}`;
}
