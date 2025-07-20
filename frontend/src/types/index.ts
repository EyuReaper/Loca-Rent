export interface userProfile {
    id: string;
    full_name: string | null;
    role: 'tenant' | 'landlord' | 'admin';
    is_verified: boolean;
    is_landlord: boolean;
    is_student: boolean;
    //add more if any
}

export interface AuthError {
    message: string;
    code?: string;
}

export interface Property {
    id: string;
    landlord_id: string;
    title: string;
    description: string;
    property_type: string;
    lease_type: 'short_term' | 'long_term' | 'student';
    price: number;
    currency: string;
    payment_frequency: string | null; // e.g., monthly, weekly
    bedrooms: number;
    bathrooms: number;
    furnished_status: string | null; // e.g., furnished, unfurnished
    pet_policy: string | null; // e.g., pets allowed, no pets
    address: string | null;
    latitiude: number | null;
    longitude: number | null;
    amenities: string;
    rules: string | null; // e.g., no smoking, no staying late
    images: string[] | null; // Array of image URLs
    is_active: boolean;
    is_premium: boolean;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
}   