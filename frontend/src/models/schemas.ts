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
/*  Base Rates schema (for BaseRatesPage - only rate fields)           */
/* ------------------------------------------------------------------ */

export const baseRatesSchema = z.object({
  child_factor: z.coerce.number().nullable().optional(),
  base_one_adult: z.coerce.number().nullable().optional(),
  base_two_adults: z.coerce.number().nullable().optional(),
  additional_adult: z.coerce.number().nullable().optional(),
  child_price: z.coerce.number().nullable().optional(),
})

export type BaseRatesFormData = z.infer<typeof baseRatesSchema>

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

/* ------------------------------------------------------------------ */
/*  Partner schema                                                      */
/* ------------------------------------------------------------------ */

export const partnerSchema = z.object({
  name: z.string().min(1, 'common.status.error_required').max(191, 'common.status.error_max'),
  email: z.string().optional().refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), 'common.status.error_invalid_email'),
  phone: z.string().optional(),
  tax_id: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  billing_rule: z.enum(['none', 'charge_partner', 'charge_guest']).optional(),
  partner_discount_percent: z.coerce.number().min(0, 'common.status.error_min_zero').max(100, 'common.status.error_max_100').optional(),
})

export type PartnerFormData = z.infer<typeof partnerSchema>

/* ------------------------------------------------------------------ */
/*  Room Block schema                                                   */
/* ------------------------------------------------------------------ */

export const blockSchema = z.object({
  room_id: z.string().min(1, 'common.status.error_required'),
  start_date: z.string().min(1, 'common.status.error_required'),
  end_date: z.string().min(1, 'common.status.error_required'),
  type: z.enum(['maintenance', 'cleaning', 'private', 'custom']),
  reason: z.string().optional().nullable(),
  recurrence: z.enum(['none', 'daily', 'weekly', 'monthly']).optional(),
})

export type BlockFormData = z.infer<typeof blockSchema>

