export type HomeSectionKey = "latest" | "best_value" | "newest_models";

export type CatalogSectionKey = "latest" | "featured" | "newest_models";

export type HomeListingCard = {
  id: string;
  title: string;
  price: number;
  year: number;
  mileage: number;
  fuelType?: string;
  images: { id: string; url: string }[];
  brand: { name: string };
  model: { name: string };
  city: { id: string; name: string };
};

export type ShowroomCatalogCard = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  indicativePrice: number | null;
  year: number;
  fuelType: string;
  transmission: string;
  featured: boolean;
  images: { id: string; url: string }[];
  brand: { name: string };
  model: { name: string };
};

// Detailed types for full page views
export type CarDimensions = {
  id: string;
  length?: number;
  width?: number;
  height?: number;
  wheelbase?: number;
  groundClearance?: number;
  bootSpace?: number;
  doors?: number;
  seating?: number;
};

export type CarEngineDetails = {
  id: string;
  type?: string;
  turbocharged: boolean;
  displacement?: number;
  cylinders?: number;
  drivetrain?: string;
  fuelSystem?: string;
  valveMechanism?: string;
  maxSpeed?: number;
};

export type CarTransmissionDetails = {
  id: string;
  type?: string;
  gearbox?: string;
};

export type CarSteering = {
  id: string;
  type?: string;
  turningRadius?: number;
  powerAssisted: boolean;
};

export type CarSuspension = {
  id: string;
  front?: string;
  frontBrakes?: string;
  rear?: string;
  rearBrakes?: string;
};

export type CarWheels = {
  id: string;
  wheelType?: string;
  tyreSize?: string;
  wheelSize?: string;
  pcd?: string;
  spareTyreSize?: string;
};

export type CarFuelEconomy = {
  id: string;
  cityMileage?: number;
  highwayMileage?: number;
  tankCapacity?: number;
};

export type CatalogDetailComplete = ShowroomCatalogCard & {
  features?: string[];
  dimensions?: CarDimensions;
  engineDetails?: CarEngineDetails;
  transmissionDetails?: CarTransmissionDetails;
  steering?: CarSteering;
  suspension?: CarSuspension;
  wheels?: CarWheels;
  fuelEconomy?: CarFuelEconomy;
};

export type HomeFeedSection = {
  key: HomeSectionKey;
  title: string;
  listings: HomeListingCard[];
};

export type CatalogFeedSection = {
  key: CatalogSectionKey;
  title: string;
  entries: ShowroomCatalogCard[];
};

export type HomeFeedResponse = {
  sections: HomeFeedSection[];
};

export type CatalogFeedResponse = {
  sections: CatalogFeedSection[];
};

export type BrowseListingsResponse = {
  listings: HomeListingCard[];
  total: number;
  skip: number;
  take: number;
};

export type BrowseCatalogResponse = {
  entries: ShowroomCatalogCard[];
  total: number;
  skip: number;
  take: number;
};

/** Same shape as browsing by section — used by `GET /listings/explore`. */
export type ExploreListingsResponse = BrowseListingsResponse;

