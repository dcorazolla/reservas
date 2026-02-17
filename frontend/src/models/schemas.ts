import { z } from 'zod'

/* ------------------------------------------------------------------ */
/*  Property schema                                                     */
/* ------------------------------------------------------------------ */

export const propertySchema = z.object({
  name: z.string().min(1, 'common.status.error_required'),
  timezone: z.string().min(1, 'common.status.error_required'),
  infant_max_age: z.coerce.number({ error: 'common.status.error_required' }).min(0, 'common.status.error_required'),
  child_max_age: z.coerce.number({ error: 'common.status.error_required' }).min(0, 'common.status.error_required'),
  child_factor: z.coerce.number({ error: 'common.status.error_required' }),
  base_one_adult: z.coerce.number({ error: 'common.status.error_required' }),
  base_two_adults: z.coerce.number({ error: 'common.status.error_required' }),
  additional_adult: z.coerce.number({ error: 'common.status.error_required' }),
  child_price: z.coerce.number({ error: 'common.status.error_required' }),
})

export type PropertyFormData = z.infer<typeof propertySchema>

/* ------------------------------------------------------------------ */
/*  Room schema                                                         */
/* ------------------------------------------------------------------ */

export const roomSchema = z.object({
  name: z.string().min(1, 'common.status.error_required'),
  number: z.string().optional().nullable(),
  room_category_id: z.string().optional().nullable(),
  beds: z.coerce.number({ error: 'common.status.error_required' }).min(1, 'common.status.error_min_one'),
  capacity: z.coerce.number({ error: 'common.status.error_required' }).min(1, 'common.status.error_min_one'),
  notes: z.string().optional().nullable(),
})

export type RoomFormData = z.infer<typeof roomSchema>

/* ------------------------------------------------------------------ */
/*  Room Category schema                                                */
/* ------------------------------------------------------------------ */

export const roomCategorySchema = z.object({
  name: z.string().min(1, 'common.status.error_required'),
  description: z.string().optional().nullable(),
})

export type RoomCategoryFormData = z.infer<typeof roomCategorySchema>

/* ------------------------------------------------------------------ */
/*  Room Category Rate schema (nested in RoomCategory modal)            */
/* ------------------------------------------------------------------ */

export const roomCategoryRateSchema = z.object({
  base_one_adult: z.coerce.number().nullable().optional(),
  base_two_adults: z.coerce.number().nullable().optional(),
  additional_adult: z.coerce.number().nullable().optional(),
  child_price: z.coerce.number().nullable().optional(),
})

export type RoomCategoryRateFormData = z.infer<typeof roomCategoryRateSchema>
