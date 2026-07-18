import { signal, inject, TransferState } from '@angular/core';
import { SESSION_USER, SESSION_USER_KEY } from '../core/models/session-user.model';

export function provideClientSessionUser() {
  return [
    {
      provide: SESSION_USER,
      useFactory: () => {
        const transferState = inject(TransferState);
        // Reads the value the server initializer embedded in the page -
        // available synchronously, before Angular even hydrates the DOM.
        // This is the piece that prevents "different auth state on server
        // vs client" during hydration: there is no client-side re-check here.
        const seeded = transferState.get(SESSION_USER_KEY, null);
        return signal(seeded);
      },
    },
  ];
}
