type Role = 'user' | 'admin' | 'super_admin';

interface PermissionMap {
  // Dashboard
  readonly viewDashboard: boolean;
  readonly viewRevenue: boolean;
  readonly viewProfit: boolean;

  // Products
  readonly viewProducts: boolean;
  readonly createProduct: boolean;
  readonly editProduct: boolean;
  readonly deleteProduct: boolean;
  readonly viewPurchasePrice: boolean;

  // Catalog (Categories & Brands)
  readonly manageCatalog: boolean;

  // Stock
  readonly viewStock: boolean;
  readonly modifyStock: boolean;
  readonly viewStockHistory: boolean;

  // Sales
  readonly viewSales: boolean;
  readonly createSale: boolean;
  readonly viewSaleProfit: boolean;

  // Reports
  readonly viewReports: boolean;

  // Users
  readonly viewUsers: boolean;
  readonly manageUsers: boolean;
  readonly managePermissions: boolean;

  // Settings
  readonly manageSettings: boolean;
}

const ROLE_PERMISSIONS: Record<Role, PermissionMap> = {
  super_admin: {
    viewDashboard: true,
    viewRevenue: true,
    viewProfit: true,
    viewProducts: true,
    createProduct: true,
    editProduct: true,
    deleteProduct: true,
    viewPurchasePrice: true,
    manageCatalog: true,
    viewStock: true,
    modifyStock: true,
    viewStockHistory: true,
    viewSales: true,
    createSale: true,
    viewSaleProfit: true,
    viewReports: true,
    viewUsers: true,
    manageUsers: true,
    managePermissions: true,
    manageSettings: true,
  },
  admin: {
    viewDashboard: true,
    viewRevenue: false,
    viewProfit: false,
    viewProducts: true,
    createProduct: false,
    editProduct: false,
    deleteProduct: false,
    viewPurchasePrice: false,
    manageCatalog: false,
    viewStock: true,
    modifyStock: false,
    viewStockHistory: false,
    viewSales: true,
    createSale: true,
    viewSaleProfit: false,
    viewReports: false,
    viewUsers: false,
    manageUsers: false,
    managePermissions: false,
    manageSettings: false,
  },
  user: {
    viewDashboard: false,
    viewRevenue: false,
    viewProfit: false,
    viewProducts: false,
    createProduct: false,
    editProduct: false,
    deleteProduct: false,
    viewPurchasePrice: false,
    manageCatalog: false,
    viewStock: false,
    modifyStock: false,
    viewStockHistory: false,
    viewSales: false,
    createSale: false,
    viewSaleProfit: false,
    viewReports: false,
    viewUsers: false,
    manageUsers: false,
    managePermissions: false,
    manageSettings: false,
  },
};

export function getPermissions(role: Role): PermissionMap {
  return ROLE_PERMISSIONS[role];
}

export type { Role, PermissionMap };
