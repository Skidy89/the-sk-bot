import axios from 'axios'
export type SearchTenorParams = {
    query: string
    country?: string
    locale?: string
    media_filter: string
    random?: boolean
    limit?: number
  }
  
  export type TenorResults = {
    id: string
    title: string
    media_formats: Record<
      string,
      {
        url: string
        duration: number
        preview: string
        dims: [number, number]
        size: number
      }
    >
    created: number
    content_description: string
    itemurl: string
    url: string
    tags: string[]
    flags: []
    hasaudio: boolean
  }[]
  
export const tenor = axios.create({
  baseURL: 'https://tenor.googleapis.com/v2',
})

tenor.interceptors.request.use((config) => {
  config.params = { ...config.params, key: process.env.TENOR_API_KEY as string }

  return config
})

export async function getTenorResults({query, limit, locale, media_filter, country, random, }: SearchTenorParams) {
    if (!limit) limit = 10
    if (!locale) locale = 'en_US'
    if (!country) country = 'US'
    if (!media_filter) media_filter = ''
    if (!random) random = false
  
    return await tenor
      .get(
        `/search?q=${query}&key=AIzaSyDSXGgndjMEkHbsjYuE--pIinguOLhfn54&client_key=skid&limit=${limit}&locale=${locale}&country=${country}&media_filter=${media_filter}&random=${random}`,
      )
      .then((response) => response.data.results as TenorResults)
      .catch(() => undefined)
  }