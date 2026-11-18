import "server-only";

import type { DemoConnectionRequest } from "../fixtures/demo-data";

export function canRevealContact({
  viewerId,
  ownerId,
  eventId,
  request,
  ownerShares,
}: {
  viewerId: string;
  ownerId: string;
  eventId: string;
  request: DemoConnectionRequest;
  ownerShares: boolean;
}): boolean {
  return viewerId !== ownerId && ownerShares && request.event_id === eventId && request.status === "accepted"
    && ((request.from_user_id === viewerId && request.to_user_id === ownerId)
      || (request.to_user_id === viewerId && request.from_user_id === ownerId));
}
