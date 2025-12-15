/**
 * Entity Configurations
 * Centralized configuration for all product entities
 */

import { EntityConfig, BaseEntity, EntityImage } from './entityTypes';

// Mobile Entity Type
export interface MobileEntity extends BaseEntity {
  mobileId: number;
  brand?: string;
  model?: string;
  color?: string;
  yearOfPurchase?: number;
}

// Car Entity Type
export interface CarEntity extends BaseEntity {
  carId: number;
  brand?: string;
  model?: string;
  color?: string;
  yearOfManufacture?: number;
  fuelType?: string;
  transmission?: string;
  mileage?: number;
}

// Laptop Entity Type
export interface LaptopEntity extends BaseEntity {
  id: number;
  title: string;
  serialNumber?: string;
  dealer?: string;
  model?: string;
  brand?: string;
  price: number;
  description?: string;
  warrantyInYear?: number;
  processor?: string;
  processorBrand?: string;
  memoryType?: string;
  screenSize?: string;
  colour?: string;
  ram?: string;
  storage?: string;
  battery?: string;
  batteryLife?: string;
  graphicsCard?: string;
  graphicBrand?: string;
  weight?: string;
  manufacturer?: string;
  usbPorts?: number;
  status?: string;
  laptopPhotos?: Array<{ photoId: number; photo_link: string; publicId: string }>;
}

// Bike Entity Type
export interface BikeEntity extends BaseEntity {
  bike_id: number;
  prize: number;
  brand?: string;
  model?: string;
  variant?: string;
  manufactureYear?: number;
  engineCC?: number;
  kilometersDriven?: number;
  fuelType?: string;
  color?: string;
  registrationNumber?: string;
  description?: string;
  sellerId?: number;
  status?: string;
  images?: Array<{ imageId: number; image_link: string; publicId: string }>;
}

// Mobile Configuration
export const mobileConfig: EntityConfig<MobileEntity> = {
  type: 'mobile',
  displayName: 'Mobile',
  displayNamePlural: 'Mobiles',

  api: {
    getAll: '/api/v1/mobiles/getAllMobiles',
    getById: (id: number) => `/api/v1/mobiles/${id}`,
  },

  idField: 'mobileId',
  titleField: 'title',
  priceField: 'price',
  imagesField: 'images',
  descriptionField: 'description',

  detailFields: [
    { key: 'brand', label: 'Brand', icon: 'cellphone' },
    { key: 'model', label: 'Model', icon: 'information' },
    { key: 'condition', label: 'Condition', icon: 'star' },
    {
      key: 'yearOfPurchase',
      label: 'Year',
      icon: 'calendar',
      format: (value) => value?.toString() || 'N/A',
    },
    { key: 'color', label: 'Color', icon: 'palette' },
  ],

  stackName: 'MobileStack',
  listScreenName: 'MobileListing',
  detailScreenName: 'MobileDetail',

  icon: 'cellphone',
  color: '#0F5E87',
};

// Car Configuration
export const carConfig: EntityConfig<CarEntity> = {
  type: 'car',
  displayName: 'Car',
  displayNamePlural: 'Cars',

  api: {
    getAll: '/api/v1/cars/getAllCars',
    getById: (id: number) => `/api/v1/cars/${id}`,
  },

  idField: 'carId',
  titleField: 'title',
  priceField: 'price',
  imagesField: 'images',
  descriptionField: 'description',

  detailFields: [
    { key: 'brand', label: 'Brand', icon: 'car' },
    { key: 'model', label: 'Model', icon: 'information' },
    { key: 'condition', label: 'Condition', icon: 'star' },
    {
      key: 'yearOfManufacture',
      label: 'Year',
      icon: 'calendar',
      format: (value) => value?.toString() || 'N/A',
    },
    { key: 'fuelType', label: 'Fuel Type', icon: 'gas-station' },
    { key: 'transmission', label: 'Transmission', icon: 'car-shift-pattern' },
    {
      key: 'mileage',
      label: 'Mileage',
      icon: 'speedometer',
      format: (value) => (value ? `${value} km` : 'N/A'),
    },
    { key: 'color', label: 'Color', icon: 'palette' },
  ],

  stackName: 'CarStack',
  listScreenName: 'CarListing',
  detailScreenName: 'CarDetail',

  icon: 'car',
  color: '#DC2626',
};

// Laptop Configuration
export const laptopConfig: EntityConfig<LaptopEntity> = {
  type: 'laptop',
  displayName: 'Laptop',
  displayNamePlural: 'Laptops',

  api: {
    getAll: '/api/laptops/getAll',
    getById: (id: number) => `/api/laptops/getById?laptop_id=${id}`,
  },

  idField: 'id',
  titleField: 'model',
  priceField: 'price',
  imagesField: 'laptopPhotos',
  descriptionField: 'manufacturer',

  detailFields: [
    { key: 'brand', label: 'Brand', icon: 'laptop' },
    { key: 'model', label: 'Model', icon: 'information' },
    { key: 'processor', label: 'Processor', icon: 'chip' },
    { key: 'ram', label: 'RAM', icon: 'memory' },
    { key: 'storage', label: 'Storage', icon: 'harddisk' },
    { key: 'graphicsCard', label: 'Graphics Card', icon: 'video-box' },
    { key: 'screenSize', label: 'Screen Size', icon: 'monitor' },
    { key: 'colour', label: 'Color', icon: 'palette' },
    { key: 'batteryLife', label: 'Battery Life', icon: 'battery-charging' },
    { key: 'weight', label: 'Weight', icon: 'weight' },
    {
      key: 'warrantyInYear',
      label: 'Warranty',
      icon: 'shield-check',
      format: (value) => value ? `${value} year${value > 1 ? 's' : ''}` : 'N/A',
    },
  ],

  stackName: 'LaptopStack',
  listScreenName: 'LaptopListing',
  detailScreenName: 'LaptopDetail',

  icon: 'laptop',
  color: '#7C3AED',
};

// Bike Configuration
export const bikeConfig: EntityConfig<BikeEntity> = {
  type: 'bike',
  displayName: 'Bike',
  displayNamePlural: 'Bikes',

  api: {
    getAll: '/bikes/get',
    getById: (id: number) => `/bikes/get/${id}`,
  },

  idField: 'bike_id',
  titleField: 'model',
  priceField: 'prize',
  imagesField: 'images',
  descriptionField: 'description',

  detailFields: [
    { key: 'brand', label: 'Brand', icon: 'motorbike' },
    { key: 'model', label: 'Model', icon: 'information' },
    { key: 'variant', label: 'Variant', icon: 'tag' },
    {
      key: 'manufactureYear',
      label: 'Year',
      icon: 'calendar',
      format: (value) => value?.toString() || 'N/A',
    },
    {
      key: 'engineCC',
      label: 'Engine',
      icon: 'engine',
      format: (value) => value ? `${value} CC` : 'N/A',
    },
    {
      key: 'kilometersDriven',
      label: 'Kilometers Driven',
      icon: 'speedometer',
      format: (value) => value ? `${value.toLocaleString()} km` : 'N/A',
    },
    { key: 'fuelType', label: 'Fuel Type', icon: 'gas-station' },
    { key: 'color', label: 'Color', icon: 'palette' },
    { key: 'registrationNumber', label: 'Registration', icon: 'card-text' },
  ],

  stackName: 'BikeStack',
  listScreenName: 'BikeListing',
  detailScreenName: 'BikeDetail',

  icon: 'motorbike',
  color: '#F59E0B',
};

// Entity Registry - Central place to access all entity configurations
export const entityRegistry: Record<string, EntityConfig> = {
  mobile: mobileConfig,
  car: carConfig,
  laptop: laptopConfig,
  bike: bikeConfig,
};

// Helper function to get entity config
export const getEntityConfig = (entityType: string): EntityConfig => {
  const config = entityRegistry[entityType];
  if (!config) {
    throw new Error(`Entity configuration not found for type: ${entityType}`);
  }
  return config;
};

// Get all entity types
export const getAllEntityTypes = (): string[] => {
  return Object.keys(entityRegistry);
};

// Get all entity configs
export const getAllEntityConfigs = (): EntityConfig[] => {
  return Object.values(entityRegistry);
};
