import { supabase } from './supabase'

export const saveContentToSupabase = async (content: any, table: string) => {
  const { error } = await supabase.from(table).insert([content])
  if (error) {
    throw new Error(`Failed to save to ${table}: ${error.message}`)
  }
}

export const getDirectVideoLink = (url: string): string => {
  // For direct links from Supabase storage, return as-is
  return url
}
