import { prisma } from "./prisma";

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  return prisma.notification.create({
    data: { userId, type, title, body, data: data ?? undefined },
  });
}

/** Tworzy konwersację 1:1 między dwoma userami (np. przy zapytaniu o wycenę / zgłoszeniu do zlecenia). */
export async function createConversation(userIdA: string, userIdB: string) {
  return prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: userIdA }, { userId: userIdB }],
      },
    },
  });
}
