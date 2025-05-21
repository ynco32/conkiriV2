// types/redux-persist.d.ts
declare module 'redux-persist/integration/react' {
  import * as React from 'react';

  export interface PersistGateProps {
    loading?: React.ComponentType<any> | React.ReactElement | null;
    children?: React.ReactNode;
    persistor: any;
    onBeforeLift?(): void | Promise<void>;
  }

  export const PersistGate: React.ComponentClass<PersistGateProps>;
}
