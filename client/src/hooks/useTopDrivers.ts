import {
  useTopDriversQuery,
} from "../queries/services/top-drivers.query";

export function useTopDrivers() {
  return useTopDriversQuery();
}
