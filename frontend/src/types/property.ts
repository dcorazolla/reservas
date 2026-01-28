export type Property = {
  id: number;
  name: string;
  timezone?: string | null;
  infant_max_age?: number | null;
  child_max_age?: number | null;
  child_factor?: number | null;
  base_one_adult?: number | null;
  base_two_adults?: number | null;
  additional_adult?: number | null;
  child_price?: number | null;
};
