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

