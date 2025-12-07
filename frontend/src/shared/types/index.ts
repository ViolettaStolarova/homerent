export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  ROOM = 'room',
  COTTAGE = 'cottage',
}

export enum Amenity {
  WIFI = 'wifi',
  KITCHEN = 'kitchen',
  TV = 'tv',
  WASHER = 'washer',
  PARKING = 'parking',
  POOL = 'pool',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum SortBy {
  RATING_DESC = 'rating_desc',
  RATING_ASC = 'rating_asc',
  PRICE_DESC = 'price_desc',
  PRICE_ASC = 'price_asc',
  DATE_DESC = 'date_desc',
  DATE_ASC = 'date_asc',
}

export enum ProfileTab {
  PERSONAL = 'personal',
  BOOKINGS = 'bookings',
  PROPERTIES = 'properties',
  INCOMING_BOOKINGS = 'incoming_bookings',
  FAVORITES = 'favorites',
}

export interface User {
  id: number
  email: string
  full_name: string
  username: string
  phone?: string
  avatar_url?: string
  role: UserRole
  created_at: string
}

export interface Property {
  id: number
  owner_id: number
  property_type: PropertyType
  title: string
  description: string
  address: string
  city: string
  max_guests: number
  bedrooms: number
  beds: number
  bathrooms: number
  price_per_night: number
  status: string
  created_at: string
  owner_name?: string
  owner_username?: string
  owner_since?: string
  rating?: number
  review_count?: number
  main_image?: string
  images?: PropertyImage[]
  amenities?: Amenity[]
  reviews?: Review[]
  unavailable_dates?: UnavailableDate[]
}

export interface PropertyImage {
  id: number
  image_url: string
  is_main: boolean
}

export interface Review {
  id: number
  user_id: number
  property_id: number
  rating: number
  comment?: string
  full_name?: string
  username?: string
  created_at: string
}

export interface UnavailableDate {
  check_in: string
  check_out: string
}

export interface Booking {
  id: number
  user_id: number
  property_id: number
  check_in: string
  check_out: string
  guests: number
  total_price: number
  status: BookingStatus
  created_at: string
  title?: string
  main_image?: string
  price_per_night?: number
  owner_name?: string
  guest_name?: string
  guest_email?: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

