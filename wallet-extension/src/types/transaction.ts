
export interface Transaction {
  id: number;
  type: string;
  token: string;
  amount: string;
  value: string;
  from?: string;    // Make optional with ?
  to?: string;      // Make optional with ?
  time: string;
  color: string;
}
