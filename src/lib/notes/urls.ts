import { NOTE_HUB_TOPIC_IDS } from "@/lib/content/route-contract";

export function buildNoteHubPath(topicId: string): string {
  return `/notes/topics/${topicId}`;
}

export function isNoteHubTopic(topicId: string): boolean {
  return (NOTE_HUB_TOPIC_IDS as readonly string[]).includes(topicId);
}

export function buildNotesTopicHref(topicId: string): string {
  return isNoteHubTopic(topicId)
    ? buildNoteHubPath(topicId)
    : `/notes?topic=${encodeURIComponent(topicId)}`;
}
