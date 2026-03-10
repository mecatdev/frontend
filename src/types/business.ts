export type BusinessOwner = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type Business = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  industry: string | null;
  stage: string | null;
  logoUrl: string | null;
  fundingAsk: number | string | null;
  fundingCurrency: string | null;
  isPublished: boolean;
  verificationStatus: string;
  createdAt: string;
  owner: BusinessOwner;
};

export type BusinessDetail = Business & {
  ownerId: string;
  description: string | null;
  websiteUrl: string | null;
  updatedAt: string;
};
