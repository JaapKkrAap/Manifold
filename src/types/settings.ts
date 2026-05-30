import { z } from 'zod'

export const AIEndpointSchema = z.object({
  id: z.string(),
  label: z.string(),
  baseUrl: z.string().url(),
  apiKey: z.string().default(''),
  model: z.string().default('gpt-4o'),
  isDefault: z.boolean().default(false),
})

export const AppSettingsSchema = z.object({
  theme: z.enum(['dark', 'light', 'system']).default('dark'),
  aiEndpoints: z.array(AIEndpointSchema).default([]),
  defaultExportFormat: z
    .enum(['sillytavern_v2', 'tavernai', 'json'])
    .default('sillytavern_v2'),
  showTokenCounts: z.boolean().default(true),
})

export type AIEndpoint = z.infer<typeof AIEndpointSchema>
export type AppSettings = z.infer<typeof AppSettingsSchema>
