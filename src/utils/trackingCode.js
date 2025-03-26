import { v4 as uuidv4 } from "uuid";

export function generateTrackingCode() {
  return uuidv4().substring(0, 5);
}
