export type ConversionType =
  | "length"
  | "temperature"
  | "weight"
  | "volume"
  | "currency"
  | "crypto";

export interface Conversion {
  id: string;
  type: ConversionType;
  from: string;
  to: string;
  value: number;
  result: number;
  timestamp: number;
}

export interface Favorite {
  id: string;
  type: ConversionType;
  from: string;
  to: string;
}

export interface ConversionUnit {
  value: string;
  label: string;
}

export interface ConversionCategory {
  type: ConversionType;
  label: string;
  units: ConversionUnit[];
}

export interface ExchangeRate {
  currency: string;
  rate: number;
}
