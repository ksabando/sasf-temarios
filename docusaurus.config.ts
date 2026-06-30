import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'SASF Temarios 2026',
  tagline: 'Academia de Software — Cursos Intensivos',
  favicon: 'img/favicon.ico',

  url: 'https://ksabando.github.io',
  baseUrl: '/sasf-temarios/',

  organizationName: 'ksabando',
  projectName: 'sasf-temarios',

  plugins: [
    [
      './plugins/docusaurus-auth',
      {
        passwordHash: '3907351ec007345d89127d1a02b8a588d58fa6361d17d5aabd4f7e910258211e',
      },
    ],
  ],

  markdown: {
    preprocessor({ fileContent }) {
      const parts = fileContent.split(/(```[\s\S]*?```)/g);
      return parts
        .map((part, i) => {
          if (i % 2 === 1) return part;
          return part
            .replace(/</g, '&#x3C;')
            .replace(/\{/g, '&#x7B;')
            .replace(/\}/g, '&#x7D;')
            .replace(/^import\s/gm, '&#x69;mport ')
            .replace(/^export\s/gm, '&#x65;xport ');
        })
        .join('');
    },
  },

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'es',
    locales: ['es'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: undefined,
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/sasf-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'SASF Temarios',
      logo: {
        alt: 'SASF Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'cursosSidebar',
          position: 'left',
          label: 'Cursos',
        },
        {
          to: '/orden-recomendado',
          label: 'Orden',
          position: 'left',
        },
        {to: '/login', label: '🔒', position: 'right', title: 'Contenido privado'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Cursos',
          items: [
            { label: 'Git', to: '/cursos/git/plan-accion' },
            { label: 'Spring Boot', to: '/cursos/spring/plan-accion' },
            { label: 'React', to: '/cursos/react/plan-accion' },
            { label: 'Docker', to: '/cursos/docker/plan-accion' },
          ],
        },
        {
          title: 'Fundamentos',
          items: [
            { label: 'Clean Code', to: '/cursos/cleancode/plan-accion' },
            { label: 'SOLID', to: '/cursos/solid/plan-accion' },
            { label: 'Patrones de Diseño', to: '/cursos/patrones-disenio/plan-accion' },
          ],
        },
        {
          title: 'Avanzado',
          items: [
            { label: 'Arquitectura', to: '/cursos/arquitectura-software/plan-accion' },
            { label: 'Diseño de APIs', to: '/cursos/diseno-apis/plan-accion' },
            { label: 'Oracle', to: '/cursos/oracle/plan-accion' },
          ],
        },
      ],
      copyright: `SASF Temarios 2026 · Academia de Software`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['java', 'bash', 'yaml', 'typescript', 'sql', 'docker', 'protobuf', 'graphql'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
