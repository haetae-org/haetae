import { useRouter } from 'next/router'

export default {
  github: 'https://github.com/haetae-org/haetae',
  project: {
    link: 'https://github.com/haetae-org/haetae',
  },
  // TODO: dynamic branch
  docsRepositoryBase:
    'https://github.com/haetae-org/haetae/blob/main/packages/docs',
  useNextSeoProps() {
    const { asPath } = useRouter()
    if (asPath !== '/') {
      return {
        titleTemplate: '%s – Haetae',
      }
    }
  },
  logo: (
    <>
      <span className="mr-2 font-extrabold hidden md:inline">Haetae</span>
      &nbsp;-&nbsp;
      <span className="text-gray-600 font-normal hidden md:inline">
        Your Smart Incremental Tasks
      </span>
    </>
  ),
  head: (
    <>
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="theme-color" content="#ffffff" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta name="description" content="Haetae: Your Smart Incremental Tasks" />
      <meta
        name="og:description"
        content="Haetae: Your Smart Incremental Tasks"
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content="https://nextra.vercel.app/og.png" />
      <meta name="twitter:site:domain" content="https://haetae-mu.vercel.app" />
      <meta name="twitter:url" content="https://https://haetae-mu.vercel.app" />
      <meta name="og:title" content="Haetae" />
      <meta name="og:description" content="Incremental Task Runner" />
      <meta name="og:image" content="https://nextra.vercel.app/og.png" />
      <meta name="apple-mobile-web-app-title" content="Haetae" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-icon-180x180.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="192x192"
        href="/android-icon-192x192.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="96x96"
        href="/favicon-96x96.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
    </>
  ),
  sidebar: {
    defaultMenuCollapseLevel: 3,
  },
  toc: {
    float: true,
  },
  navigation: {
    prev: true,
    next: true,
  },
  footer: {
    text: (
      <span>
        MIT {new Date().getFullYear()} © jjangga0214 &nbsp;
        <a
          href="https://github.com/haetae-org/haetae"
          target="_blank"
          rel="noreferrer"
        >
          Haetae
        </a>
        .
      </span>
    ),
  },
}
