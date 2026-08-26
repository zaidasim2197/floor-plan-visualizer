import type { Stall } from "@/lib/booking-types";

/**
 * DEMO EXHIBITION LAYOUT — fictional layout inspired by professional venue maps.
 * This is not the real Marriott floor plan. Replace this data file (and only this
 * file) when the client supplies the official plan.
 */

export const MAP_WIDTH = 1200;
export const MAP_HEIGHT = 800;

export const stalls: Stall[] = [
  // Zone A — West Hall
  { id: "A01", stallNumber: "A01", category: "Standard Exhibition Stall", size: "3m x 3m", price: 185000, x: 120, y: 180, w: 90, h: 80, zone: "Zone A — West Hall" },
  { id: "A02", stallNumber: "A02", category: "Standard Exhibition Stall", size: "3m x 3m", price: 185000, x: 214, y: 180, w: 90, h: 80, zone: "Zone A — West Hall" },
  { id: "A03", stallNumber: "A03", category: "Standard Exhibition Stall", size: "3m x 3m", price: 175000, x: 120, y: 264, w: 90, h: 80, zone: "Zone A — West Hall" },
  { id: "A04", stallNumber: "A04", category: "Standard Exhibition Stall", size: "3m x 3m", price: 175000, x: 214, y: 264, w: 90, h: 80, zone: "Zone A — West Hall" },
  { id: "A05", stallNumber: "A05", category: "Corner Stall", size: "3m x 4m", price: 225000, x: 120, y: 348, w: 90, h: 80, zone: "Zone A — West Hall" },
  { id: "A06", stallNumber: "A06", category: "Corner Stall", size: "3m x 4m", price: 225000, x: 214, y: 348, w: 90, h: 80, zone: "Zone A — West Hall" },

  // Zone B — Central Hall
  { id: "B01", stallNumber: "B01", category: "Standard Exhibition Stall", size: "4m x 3m", price: 210000, x: 380, y: 180, w: 110, h: 90, zone: "Zone B — Central Hall" },
  { id: "B02", stallNumber: "B02", category: "Standard Exhibition Stall", size: "4m x 3m", price: 210000, x: 494, y: 180, w: 110, h: 90, zone: "Zone B — Central Hall" },
  { id: "B03", stallNumber: "B03", category: "Standard Exhibition Stall", size: "4m x 3m", price: 200000, x: 380, y: 274, w: 110, h: 90, zone: "Zone B — Central Hall" },
  { id: "B04", stallNumber: "B04", category: "Standard Exhibition Stall", size: "4m x 3m", price: 200000, x: 494, y: 274, w: 110, h: 90, zone: "Zone B — Central Hall" },
  { id: "B05", stallNumber: "B05", category: "Premium Island", size: "8m x 3m", price: 420000, x: 380, y: 368, w: 224, h: 80, zone: "Zone B — Central Hall" },

  // Zone C — East Hall
  { id: "C01", stallNumber: "C01", category: "Standard Exhibition Stall", size: "4m x 3m", price: 205000, x: 680, y: 180, w: 100, h: 90, zone: "Zone C — East Hall" },
  { id: "C02", stallNumber: "C02", category: "Standard Exhibition Stall", size: "4m x 3m", price: 205000, x: 784, y: 180, w: 100, h: 90, zone: "Zone C — East Hall" },
  { id: "C03", stallNumber: "C03", category: "Standard Exhibition Stall", size: "4m x 3m", price: 195000, x: 680, y: 274, w: 100, h: 90, zone: "Zone C — East Hall" },
  { id: "C04", stallNumber: "C04", category: "Standard Exhibition Stall", size: "4m x 3m", price: 195000, x: 784, y: 274, w: 100, h: 90, zone: "Zone C — East Hall" },
  { id: "C05", stallNumber: "C05", category: "Premium Island", size: "8m x 3m", price: 410000, x: 680, y: 368, w: 204, h: 80, zone: "Zone C — East Hall" },

  // Zone D — Innovation Pods
  { id: "D01", stallNumber: "D01", category: "Compact Pod", size: "2m x 2m", price: 95000, x: 960, y: 180, w: 110, h: 80, zone: "Zone D — Innovation Pods" },
  { id: "D02", stallNumber: "D02", category: "Compact Pod", size: "2m x 2m", price: 95000, x: 960, y: 264, w: 110, h: 80, zone: "Zone D — Innovation Pods" },
  { id: "D03", stallNumber: "D03", category: "Compact Pod", size: "2m x 2m", price: 88000, x: 960, y: 348, w: 110, h: 80, zone: "Zone D — Innovation Pods" },
  { id: "D04", stallNumber: "D04", category: "Compact Pod", size: "2m x 2m", price: 88000, x: 960, y: 432, w: 110, h: 80, zone: "Zone D — Innovation Pods" },
];

export interface Facility {
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tone: "stage" | "service" | "amenity" | "access";
}

export const facilities: Facility[] = [
  { label: "Keynote Stage", sublabel: "Main presentation area", x: 120, y: 60, w: 484, h: 90, tone: "stage" },
  { label: "Networking Lounge", x: 680, y: 60, w: 204, h: 90, tone: "amenity" },
  { label: "Information Desk", x: 960, y: 60, w: 110, h: 90, tone: "service" },
  { label: "Restrooms", x: 120, y: 470, w: 184, h: 70, tone: "service" },
  { label: "Café & Refreshments", x: 380, y: 480, w: 224, h: 110, tone: "amenity" },
  { label: "Seating & Meeting Points", x: 680, y: 480, w: 204, h: 110, tone: "amenity" },
  { label: "Registration & Badge Collection", x: 380, y: 630, w: 504, h: 70, tone: "service" },
  { label: "Main Entrance", x: 560, y: 720, w: 144, h: 50, tone: "access" },
  { label: "Emergency Exit", x: 40, y: 620, w: 110, h: 44, tone: "access" },
  { label: "Emergency Exit", x: 1000, y: 620, w: 110, h: 44, tone: "access" },
];

export const aisles = [
  { label: "Main Aisle", x: 108, y: 440, w: 976, h: 24, vertical: false },
  { label: "", x: 320, y: 170, w: 44, h: 400, vertical: true },
  { label: "", x: 620, y: 170, w: 44, h: 400, vertical: true },
  { label: "", x: 900, y: 170, w: 44, h: 400, vertical: true },
];

export const getStall = (id: string) => stalls.find((s) => s.id === id);
