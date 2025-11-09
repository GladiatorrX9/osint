import { createParser } from "nuqs";
import type { ExtendedColumnSort } from "@/types/data-table";

const SORT_SEPARATOR = ".";
const ARRAY_SEPARATOR = ",";

/**
 * Returns a parser for sorting state that validates column IDs
 */
export function getSortingStateParser<TData>(columnIds: Set<string>) {
  return createParser<ExtendedColumnSort<TData>[]>({
    parse(value: string) {
      try {
        const sorts = value
          .split(ARRAY_SEPARATOR)
          .map((item) => {
            const [id, direction] = item.split(SORT_SEPARATOR);
            if (!id || !direction) return null;
            if (!columnIds.has(id)) return null;
            if (direction !== "asc" && direction !== "desc") return null;
            return { id, desc: direction === "desc" };
          })
          .filter(Boolean) as ExtendedColumnSort<TData>[];

        return sorts;
      } catch {
        return null;
      }
    },
    serialize(value: ExtendedColumnSort<TData>[]) {
      if (!value || value.length === 0) return "";
      return value
        .map(
          (sort) => `${sort.id}${SORT_SEPARATOR}${sort.desc ? "desc" : "asc"}`
        )
        .join(ARRAY_SEPARATOR);
    },
  });
}
