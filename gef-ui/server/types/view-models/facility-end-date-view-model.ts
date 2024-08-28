export type ViewModelErrors = {
  errorSummary: { text: string; href: string }[];
  fieldErrors: Record<string, { text: string }>;
};

export type FacilityEndDateViewModel = {
  dealId: string;
  facilityId: string;
  facilityEndDate?: { day: string; month: string; year: string };
  previousPage: string;
  status?: string;
  errors?: ViewModelErrors | null;
};