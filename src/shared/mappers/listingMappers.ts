// src/mappers/listingMappers.ts
import { MobileDetailsFormValues } from '../form/schemas/mobileDetailsSchema';
import { LaptopDetailsFormValues } from '../form/schemas/laptopDetailsSchema';
import { BikeDetailsFormValues, BikeFuelType } from '../form/schemas/bikeDetailsSchema';
import {
  CarDetailsFormValues,
  CarFuelType,
  CarTransmissionType,
} from '../form/schemas/carDetailsSchema';
import { Condition, ListingStatus } from '../types/listings';

export interface MobileCreateDTO {
  title: string;
  description: string;
  price: number;
  negotiable: boolean;
  condition: 'NEW' | 'USED' | 'REFURBISHED';
  modelId: number;
  color?: string | null;
  state: string;
  city: string;
  address: string;
  yearOfPurchase: number;
  sellerId: number;
}

export interface CarCreateDTO {
  title: string;
  description: string;
  airbag: boolean;
  abs: boolean;
  buttonStart: boolean;
  sunroof: boolean;
  childSafetyLocks: boolean;
  acFeature: boolean;
  musicFeature: boolean;
  price: number;
  negotiable: boolean;
  condition: Condition;
  brand: string;
  model: string;
  variant: string;
  color: string;
  yearOfPurchase: number;
  fuelType: CarFuelType;
  carInsurance: boolean;
  carInsuranceDate?: string;
  carInsuranceType?: string;
  transmission: CarTransmissionType;
  powerWindowFeature: boolean;
  rearParkingCameraFeature: boolean;
  kmDriven: number;
  numberOfOwners: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
  sellerId: number;
}

export interface LaptopCreateDTO {
  serialNumber: string;
  dealer?: string;
  brand: string;
  model: string;
  price: number;
  warrantyInYear: number;
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
  status: ListingStatus;
  sellerId: number;
}

export interface BikeCreateDTO {
  prize: number;
  brand: string;
  model: string;
  variant: string;
  manufactureYear: number;
  engineCC?: number;
  kilometersDriven?: number;
  fuelType: BikeFuelType;
  color: string;
  registrationNumber: string;
  description: string;
  sellerId: number;
  status: ListingStatus;
}

const trimOrUndefined = (value?: string | null) => {
  if (value == null) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const toNumericValue = (input: string, fallback: number = 0) => {
  const parsed = Number(input);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toOptionalNumber = (input: string): number | undefined => {
  const trimmed = input.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const toMobileCreateDTO = (
  values: MobileDetailsFormValues,
  sellerId: number,
): MobileCreateDTO => {
  const priceValue = Number(values.price);
  if (!Number.isFinite(priceValue)) {
    throw new Error('Invalid price');
  }
  const price = Number(priceValue.toFixed(2));
  const yearOfPurchase = Number(values.yearOfPurchase);

  if (!values.modelId) {
    throw new Error('Model is required');
  }

  const colorValue = values.color?.trim();
  const hasColor = colorValue && colorValue.length > 0;

  const dto: MobileCreateDTO = {
    title: values.title.trim(),
    description: values.description.trim(),
    price,
    negotiable: values.negotiable === true,
    condition: values.condition.toUpperCase() as 'NEW' | 'USED' | 'REFURBISHED',
    modelId: values.modelId,
    yearOfPurchase,
    state: values.state.trim(),
    city: values.city.trim(),
    address: values.address.trim(),
    sellerId,
  };

  if (hasColor) {
    dto.color = colorValue;
  }

  return dto;
};

export const toCarCreateDTO = (
  values: CarDetailsFormValues,
  sellerId: number,
): CarCreateDTO => {
  const price = toNumericValue(values.price, 0);
  const year = toNumericValue(values.yearOfPurchase, new Date().getFullYear());
  const kilometersDriven = toNumericValue(values.kmDriven, 0);
  const owners = toNumericValue(values.numberOfOwners, 1);

  const payload: CarCreateDTO = {
    title: values.title.trim(),
    description: values.description.trim(),
    airbag: values.airbag === true,
    abs: values.abs === true,
    buttonStart: values.buttonStart === true,
    sunroof: values.sunroof === true,
    childSafetyLocks: values.childSafetyLocks === true,
    acFeature: values.acFeature === true,
    musicFeature: values.musicFeature === true,
    price,
    negotiable: values.negotiable === true,
    condition: (values.condition ?? 'USED') as Condition,
    brand: values.brand.trim(),
    model: values.model.trim(),
    variant: values.variant.trim(),
    color: values.color.trim(),
    yearOfPurchase: year,
    fuelType: (values.fuelType ?? 'PETROL') as CarFuelType,
    carInsurance: values.carInsurance === true,
    transmission: (values.transmission ?? 'MANUAL') as CarTransmissionType,
    powerWindowFeature: values.powerWindowFeature === true,
    rearParkingCameraFeature: values.rearParkingCameraFeature === true,
    kmDriven: kilometersDriven,
    numberOfOwners: owners,
    address: values.address.trim(),
    city: values.city.trim(),
    state: values.state.trim(),
    pincode: values.pincode.trim(),
    sellerId,
  };

  if (values.carInsurance === true) {
    const insuranceDate = trimOrUndefined(values.carInsuranceDate);
    if (insuranceDate) {
      payload.carInsuranceDate = insuranceDate;
    }

    const insuranceType = trimOrUndefined(values.carInsuranceType);
    if (insuranceType) {
      payload.carInsuranceType = insuranceType;
    }
  }

  return payload;
};

export const toBikeCreateDTO = (
  values: BikeDetailsFormValues,
  sellerId: number,
): BikeCreateDTO => {
  const manufactureYear = toNumericValue(values.manufactureYear, new Date().getFullYear());
  const engineCC = toOptionalNumber(values.engineCC);
  const kilometersDriven = toOptionalNumber(values.kilometersDriven);

  const payload: BikeCreateDTO = {
    prize: toNumericValue(values.prize),
    brand: values.brand.trim(),
    model: values.model.trim(),
    variant: values.variant.trim(),
    manufactureYear,
    fuelType: values.fuelType as BikeFuelType,
    color: values.color.trim(),
    registrationNumber: values.registrationNumber.trim(),
    description: values.description.trim(),
    sellerId,
    status: 'ACTIVE',
  };

  if (engineCC !== undefined) {
    payload.engineCC = engineCC;
  }

  if (kilometersDriven !== undefined) {
    payload.kilometersDriven = kilometersDriven;
  }

  return payload;
};

export const toLaptopCreateDTO = (
  values: LaptopDetailsFormValues,
  sellerId: number,
): LaptopCreateDTO => {
  const price = Number(values.price);
  const warranty = Number(values.warrantyInYear);
  const usbPortsValue =
    values.usbPorts !== undefined && values.usbPorts !== null && `${values.usbPorts}`.trim().length > 0
      ? Number(values.usbPorts)
      : undefined;

  return {
    serialNumber: values.serialNumber.trim(),
    dealer: trimOrUndefined(values.dealer),
    model: values.model.trim(),
    brand: values.brand.trim(),
    price: Number.isFinite(price) ? price : 0,
    warrantyInYear: Number.isFinite(warranty) ? warranty : 0,
    processor: trimOrUndefined(values.processor),
    processorBrand: trimOrUndefined(values.processorBrand),
    memoryType: trimOrUndefined(values.memoryType),
    screenSize: trimOrUndefined(values.screenSize),
    colour: trimOrUndefined(values.colour),
    ram: trimOrUndefined(values.ram),
    storage: trimOrUndefined(values.storage),
    battery: trimOrUndefined(values.battery),
    batteryLife: trimOrUndefined(values.batteryLife),
    graphicsCard: trimOrUndefined(values.graphicsCard),
    graphicBrand: trimOrUndefined(values.graphicBrand),
    weight: trimOrUndefined(values.weight),
    manufacturer: trimOrUndefined(values.manufacturer),
    usbPorts: Number.isFinite(usbPortsValue ?? NaN) ? usbPortsValue : undefined,
    status: 'ACTIVE',
    sellerId,
  };
};