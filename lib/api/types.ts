export type UserRole = "OWNER" | "MANAGER" | "STAFF";

export interface UserSession {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  business: {
    id: string;
    name: string;
    slug: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  role: UserRole;
}

export interface LoyaltyProgram {
  id: string;
  businessId: string;
  name: string;
  stampsRequired: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyReward {
  id: string;
  businessId: string;
  programId: string;
  name: string;
  description: string | null;
  stampsRequired: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  businessId: string;
  programId: string;
  name: string | null;
  phone: string;
  email: string | null;
  stampBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface StampLedger {
  id: string;
  businessId: string;
  customerId: string;
  amount: number;
  type: "EARN" | "REDEEM" | "ADJUSTMENT";
  description: string | null;
  createdAt: string;
}

export interface RewardRedemption {
  id: string;
  businessId: string;
  customerId: string;
  rewardId: string;
  stampsUsed: number;
  status: "COMPLETED" | "CANCELLED";
  createdAt: string;
  customer?: {
    id: string;
    name: string | null;
    phone: string;
    email?: string | null;
  };
  reward?: {
    id: string;
    name: string;
    description?: string | null;
    stampsRequired: number;
  };
}

export interface StaffMember {
  id: string;
  userId: string;
  businessId: string;
  role: UserRole;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export interface DashboardStats {
  customers: number;
  stampsIssued: number;
  activeRewards: number;
  redemptions: number;
}

export interface ActivityItem {
  id: string;
  type: "STAMP" | "REDEMPTION" | "CUSTOMER";
  description: string;
  timestamp: string;
}
