import "server-only";

/**
 * Private demo-only contact fixture.
 * This module must only be imported by server components, server actions,
 * route handlers, or server-side repository code.
 * Never pass this array to a client component or serialize it into page props.
 */
export interface DemoProfilePrivate {
  profile_id: string;
  contact_handle: string;
  /** Explicit owner preference. New profiles default to false. */
  share_contact_on_accept: boolean;
}

export const profilePrivate: DemoProfilePrivate[] = [
  { profile_id: "p-asha", contact_handle: "asha.demo@example.invalid", share_contact_on_accept: true },
  { profile_id: "p-rohan", contact_handle: "rohan.demo@example.invalid", share_contact_on_accept: false },
  { profile_id: "p-meera", contact_handle: "meera.demo@example.invalid", share_contact_on_accept: true },
  { profile_id: "p-karthik", contact_handle: "karthik.demo@example.invalid", share_contact_on_accept: true },
  { profile_id: "p-divya", contact_handle: "divya.demo@example.invalid", share_contact_on_accept: true },
  { profile_id: "p-imran", contact_handle: "imran.demo@example.invalid", share_contact_on_accept: false },
  { profile_id: "p-nisha", contact_handle: "nisha.demo@example.invalid", share_contact_on_accept: false },
  { profile_id: "p-vikram", contact_handle: "vikram.demo@example.invalid", share_contact_on_accept: true },
];
