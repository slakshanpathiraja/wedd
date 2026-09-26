export interface GuestRsvp {
  phoneNumber: string;
  initial: string;
  name: string;
  rsvp: string;
  countInvite: number;
  countConform: number;
  comment: string;
  wish: string;
  inviteCode: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UpdateRsvpPayload {
  inviteCode: string;
  rsvp: string;
  countConform: number;
  comment: string;
  wish: string;
  phoneNumber?: string;
}

