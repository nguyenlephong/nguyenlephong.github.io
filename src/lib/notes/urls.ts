export function buildNotesTopicHref(topicId: string): string {
  return `/notes?topic=${encodeURIComponent(topicId)}`;
}
