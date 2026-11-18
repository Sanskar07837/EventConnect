import "server-only";

import type { DemoAttendance, DemoEvent, DemoProfile } from "../fixtures/demo-data";

type Attendance = Omit<DemoAttendance, "id">;

export function attendsEvent(attendance: Attendance | undefined, profileId: string, eventId: string) {
  return attendance?.user_id === profileId && attendance.event_id === eventId
    && (attendance.status === "interested" || attendance.status === "going");
}

export function canDiscoverAttendee({
  event, viewer, viewerAttendance, target, targetAttendance, targetDiscoverable,
}: {
  event: DemoEvent;
  viewer: DemoProfile | undefined;
  viewerAttendance: Attendance | undefined;
  target: DemoProfile;
  targetAttendance: Attendance;
  targetDiscoverable: boolean;
}) {
  return !event.is_junior_event && viewer?.is_18_plus === true && viewer.id !== target.id
    && attendsEvent(viewerAttendance, viewer.id, event.id)
    && target.is_18_plus === true && targetDiscoverable
    && targetAttendance.visibility === "public" && attendsEvent(targetAttendance, target.id, event.id);
}
