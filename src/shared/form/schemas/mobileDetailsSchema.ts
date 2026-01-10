// src/form/schemas/mobileDetailsSchema.ts
import { z } from 'zod';

export const MIN_MOBILE_YEAR = 2000;
export const CURRENT_YEAR = new Date().getFullYear();

// Helper function to count words
const wordCount = (s: string): number => {
  return s.trim().split(/\s+/).filter(Boolean).length;
};

// Reasonable characters for title: letters, numbers, spaces, and basic punctuation
const TITLE_REGEX = /^[a-zA-Z0-9\s\-.,()&']+$/;

// Check for excessive special symbols spam (more than 20% special chars)
const hasExcessiveSpecialChars = (str: string): boolean => {
  const specialChars = str.match(/[^a-zA-Z0-9\s]/g);
  const specialCharCount = specialChars ? specialChars.length : 0;
  const totalChars = str.length;
  return totalChars > 0 && specialCharCount / totalChars > 0.2;
};

const priceValidator = z
  .string()
  .min(1, 'Please enter a valid price')
  .refine(
    (value) => /^\d{1,8}(\.\d{1,2})?$/.test(value),
    'Enter a valid price with up to 8 digits and 2 decimals'
  )
  .refine((value) => {
    const price = Number(value);
    return Number.isFinite(price) && price >= 1 && price <= 10_000_000;
  }, 'Price must be between 1 and 10000000');

const conditionSchema = z.union([
  z.literal('NEW'),
  z.literal('USED'),
  z.literal('REFURBISHED'),
]);

const HEX_REGEX = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;
const NAME_REGEX = /^[A-Za-z\s]{2,30}$/;

export const mobileDetailsSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be 5–150 characters')
    .max(150, 'Title must be 5–150 characters')
    .refine(
      (val) => TITLE_REGEX.test(val),
      'Title can only contain letters, numbers, spaces, and basic punctuation'
    ),
  description: z
    .string()
    .min(1, 'Description is required')
    .refine(
      (val) => {
        const count = wordCount(val);
        return count >= 5 && count <= 70;
      },
      'Description must be 5–70 words'
    )
    .refine(
      (val) => !hasExcessiveSpecialChars(val),
      'Description contains too many special characters'
    ),
  price: priceValidator,
  negotiable: z.boolean({ required_error: 'Select negotiable option' }),
  condition: conditionSchema,
  brand: z
    .string()
    .min(2, 'Brand name is required')
    .max(40, 'Brand name must not exceed 40 characters')
    .refine(
      (val) => !/^\d+$/.test(val.trim()),
      'Brand name cannot be numbers only'
    ),
  model: z.string().min(1, 'Model name is required').max(40, 'Model name must not exceed 40 characters'),
  modelId: z.number({ required_error: 'Please select a model' }),
  color: z
    .string()
    .trim()
    .min(1, 'Color is required')
    .refine(
      (v) => HEX_REGEX.test(v) || NAME_REGEX.test(v),
      'Enter a valid color name (2–30 letters) or hex code with # (e.g., #fff, #1a2b3c)'
    ),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  address: z.string().min(1, 'Address/Locality is required'),
  yearOfPurchase: z
    .string()
    .min(4, 'Please select year of purchase')
    .refine((value) => {
      const year = Number(value);
      return (
        Number.isFinite(year) &&
        year.toString().length === 4 &&
        year >= MIN_MOBILE_YEAR &&
        year <= CURRENT_YEAR
      );
    }, `Select a valid year between ${MIN_MOBILE_YEAR} and ${CURRENT_YEAR}`),
});

export type MobileDetailsFormValues = z.infer<typeof mobileDetailsSchema>;

export const getDefaultMobileDetailsValues = (): MobileDetailsFormValues => ({
  title: 'Samsung Galaxy S21 Ultra 5G',
  description: 'Lightly used flagship smartphone with 108MP camera, 5000mAh battery, and 12GB RAM.',
  price: '49999',
  negotiable: undefined as any,
  condition: undefined as any,
  brand: '',
  model: '',
  modelId: undefined as any,
  color: 'Phantom Black',
  state: '',
  city: '',
  address: '',
  yearOfPurchase: '2022',
});

//
//   title: 'Samsung Galaxy S21 Ultra 5G',
//   description: 'Lightly used flagship smartphone with 108MP camera, 5000mAh battery, and 12GB RAM.',
//   price: '49999',
//   negotiable: undefined as any,
//   condition: undefined as any,
//   brand: 'Samsung',
//   model: 'Galaxy S21 Ultra',
//   color: 'Phantom Black',
//   yearOfPurchase: '2022',


//   title: null,
//   description: null,
//   price: null,
//   negotiable: null,
//   condition: null,
//   brand: null,
//   model: null,
//   color: null,
//   yearOfPurchase: null,
