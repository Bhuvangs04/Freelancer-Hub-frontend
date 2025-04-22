import axios from "axios";

export interface PortfolioViewDetail {
  ip: string;
  location: {
    country: string;
    region: string;
    city: string;
  };
  timestamp: string;
}

export interface PortfolioReport {
  viewCount: number;
  viewDetails: PortfolioViewDetail[];
}

export const getPortfolioReport = async (
  freelancerId: string
): Promise<PortfolioReport> => {
  try {
    // Correct endpoint according to user's request
    const response = await axios.get(
      `${
        import.meta.env.VITE_API_URL
      }/freelancer/freelancer/portfolio/report?freelancerId=${freelancerId}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching portfolio report:", error);
    throw error;
  }
};

// Helper function to check if user has exceeded free tier limit
export const hasExceededFreeTierLimit = (viewCount: number): boolean => {
  const FREE_TIER_LIMIT = 1500;
  return viewCount > FREE_TIER_LIMIT;
};

// Group views by country
export const groupViewsByCountry = (
  viewDetails: PortfolioViewDetail[]
): Record<string, number> => {
  return viewDetails.reduce((acc, view) => {
    const country = view.location.country;
    if (!country) return acc;

    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

// Group views by month
export const groupViewsByMonth = (
  viewDetails: PortfolioViewDetail[]
): Record<string, number> => {
  return viewDetails.reduce((acc, view) => {
    const date = new Date(view.timestamp);
    const monthYear = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    acc[monthYear] = (acc[monthYear] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

// Group views by year
export const groupViewsByYear = (
  viewDetails: PortfolioViewDetail[]
): Record<string, number> => {
  return viewDetails.reduce((acc, view) => {
    const date = new Date(view.timestamp);
    const year = date.getFullYear().toString();

    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};
