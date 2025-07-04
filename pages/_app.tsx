import '@mantine/core/styles.css';

import type { AppProps } from 'next/app';
import Head from 'next/head';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
// import { theme } from '../theme';

import '@mantine/dropzone/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/notifications/styles.css';

// function Demo() {
//   return (
//     <MantineProvider>
//       <Notifications />
//       {/* Your app here */}
//     </MantineProvider>
//   );
// }

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider>
      <Notifications />
      <ModalsProvider>
        <Head>
          <title>Charles J. Construction Services</title>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
          />
          <link rel="shortcut icon" href="/favicon.svg" />
          ``
        </Head>
      </ModalsProvider>
      <Component {...pageProps} />
    </MantineProvider>
  );
}
