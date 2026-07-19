import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import {
  selectClientMessages,
  toSerializableClientMessages,
  type ClientMessageScope
} from "@/i18n/client-message-scopes";

type ScopedIntlProviderProps = {
  children: ReactNode;
  scope: ClientMessageScope;
};

export default async function ScopedIntlProvider({
  children,
  scope
}: ScopedIntlProviderProps) {
  const messages = await getMessages();
  const selectedMessages = selectClientMessages(messages, scope);

  return (
    <NextIntlClientProvider
      messages={toSerializableClientMessages(selectedMessages)}
    >
      {children}
    </NextIntlClientProvider>
  );
}
