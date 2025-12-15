export type EntityType = 'mobile' | 'car' | 'laptop' | 'bike';

export interface BookableEntity {
  id: number;
  title: string;
  price: number;
  imageUrl?: string;
  status: 'ACTIVE' | 'SOLD' | 'DRAFT' | 'DELETED';
  sellerId: number;
}

// ========================================
// MOBILE BOOKING BLOCK
// ========================================
export interface MobileEntity extends BookableEntity {
  mobileId: number;
  brand: string;
  model: string;
  condition: string;
  year: number;
  color: string;
  description: string;
  isNegotiable: boolean;
  images: string[];
  userId: number;
}

// ========================================
// CAR BOOKING BLOCK
// ========================================
export interface CarEntity extends BookableEntity {
  carId: number;
  brand: string;
  model: string;
  condition: string;
  year: number;
  color: string;
  description: string;
  isNegotiable: boolean;
  images: string[];
  userId: number;
}

// ========================================
// LAPTOP BOOKING BLOCK
// ========================================
export interface LaptopEntity extends BookableEntity {
  id: number;
  serialNumber?: string;
  dealer?: string;
  model?: string;
  brand?: string;
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
  laptopPhotos?: Array<{ photoId: number; photo_link: string; publicId: string }>;
}

// ========================================
// BIKE BOOKING BLOCK
// ========================================
export interface BikeEntity extends BookableEntity {
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
  images?: Array<{ imageId: number; image_link: string; publicId: string }>;
}
