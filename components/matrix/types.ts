// Types for Mitosis Matrix API responses

export interface MatrixPortfolioItem {
    asset: string;
    totalAssetAmount: string;
    estTheoYield: string;
    mitoPoints: string;
    estTheoTokenAmount: number;
    share: number;
    holdingDurationDate: number;
    depositStartDate: string;
  }
  
  export interface MatrixEligibilityRequirement {
    eligiblity: boolean;
    phase: number;
    requirements: string[];
  }
  
  export interface MatrixEligibilityResponse {
    eligibilities: MatrixEligibilityRequirement[];
  } 