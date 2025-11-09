export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

export interface DataTableSearchableColumn<TData> {
  id: keyof TData;
  title: string;
}

export interface DataTableFilterableColumn<TData>
  extends DataTableSearchableColumn<TData> {
  options: Option[];
}

export interface Range {
  min: number;
  max: number;
}

export interface ExtendedColumnSort<TData> {
  id: string;
  desc: boolean;
}

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    range?: Range;
    unit?: string;
    variant?:
      | "text"
      | "number"
      | "range"
      | "select"
      | "multiSelect"
      | "multi-select"
      | "date"
      | "dateRange"
      | "date-range"
      | "slider";
    filterVariant?:
      | "text"
      | "number"
      | "range"
      | "select"
      | "multiSelect"
      | "multi-select"
      | "date"
      | "dateRange"
      | "date-range"
      | "slider";
    placeholder?: string;
    label?: string;
    options?: Option[];
  }
}
