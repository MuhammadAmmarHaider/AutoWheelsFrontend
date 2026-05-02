import type { HomeListingCard } from "./home-listing";

export type FavoriteWithListing = {
  id: string;
  listingId: string;
  listing: HomeListingCard;
};

export type FavoritesPageResponse = {
  favorites: FavoriteWithListing[];
  total: number;
  skip: number;
  take: number;
};

export type FavoriteListingIdsResponse = {
  listingIds: string[];
};
