// Type definitions for API responses
export interface BackendCategory {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  icon?: string;
  sort_order?: number;
  is_active: boolean;
  productCount?: number;
}

export interface BackendProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  brand?: string;
  tags: string[];
  images: string[];
  thumbnail?: string;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  categoryId: string;
  subCategoryId: string;
  status: string;
  isFeatured: boolean;
  rating: any;
  totalSold: number;
}

export interface BackendBanner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface UploadResult {
  url: string;
  publicId: string;
  filename?: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  addresses?: any[];
  paymentMethods?: string[];
}