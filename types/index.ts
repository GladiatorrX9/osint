// Navigation types
export interface NavItem {
  title: string;
  url: string;
  icon?: string;
  isActive?: boolean;
  shortcut?: string[];
  items?: NavItem[];
}

// Re-export API types
export * from "./api";
