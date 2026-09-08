import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const work = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/work' }),
  schema: () =>
    z.object({
      title: z.string(),
      order: z.number(),
      featured: z.boolean().default(false),
      room: z.enum(['technology', 'people', 'institutions']),
      question: z.string(),
      recommendation: z.string(),
      format: z.enum([
        'Decision memo',
        'Policy memo',
        'Advisory memo',
        'Research paper',
        'Development plan',
        'Field report',
      ]),
      date: z.coerce.date(),
      dateLabel: z.string(),
      addressee: z.string(),
      authorRole: z.string(),
      label: z.enum(['academic', 'real']),
      coauthors: z.array(z.string()).default([]),
      focusAreas: z.array(z.string()),
      // `null` marks a document withheld pending the correct source file (see doc 06).
      pdf: z.string().nullable(),
      pages: z.number().nullable(),
      words: z.number().nullable(),
      // slug of a file in src/assets/documents/<previewImage>.png, resolved by
      // DocumentPreview.astro via a static glob import; null when withheld.
      previewImage: z.string().nullable(),
      shows: z.array(z.string()),
      options: z
        .array(
          z.object({
            title: z.string(),
            summary: z.string(),
            verdict: z.enum(['chosen', 'considered']).default('considered'),
          }),
        )
        .optional(),
      excerpt: z.string(),
    }),
});

export const collections = { work };
