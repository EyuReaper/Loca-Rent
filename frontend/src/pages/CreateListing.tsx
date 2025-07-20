import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import ImageUploader from '../components/ImageUploader'; // Import the image uploader
import { Property } from '../types'; // Import Property interface

// Define form input types
interface ListingFormInputs {
  title: string;
  description: string;
  property_type: string;
  lease_type: 'short-term' | 'long-term' | 'student';
  price: number;
  currency: string;
  payment_frequency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  furnished_status: string;
  pet_policy: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  amenities: string[];
  rules: string;
  images: File[]; // For file objects before upload
}

const propertyTypes = ['Apartment', 'House', 'Studio', 'Room', 'Commercial', 'Land'];
const leaseTypes = ['short-term', 'long-term', 'student'];
const furnishedOptions = ['Furnished', 'Unfurnished', 'Partially Furnished'];
const petPolicyOptions = ['Pets Allowed', 'No Pets'];
const currencies = ['ETB', 'USD', 'GBP']; // Expand as needed
const paymentFrequencies = ['per_month', 'per_week', 'per_night']; // Adjust based on lease type

const amenitiesOptions = [
  'Wi-Fi', 'Parking', 'Balcony', 'AC', 'Laundry', 'Gym', 'Security',
  'Garden', 'Swimming Pool', 'Elevator', 'Hot Water', 'Dishwasher'
];


const CreateListing: React.FC = () => {
  const { userProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<ListingFormInputs>({
    defaultValues: {
      title: '',
      description: '',
      property_type: 'Apartment',
      lease_type: 'long-term',
      price: 0,
      currency: 'ETB',
      payment_frequency: 'per_month',
      bedrooms: null,
      bathrooms: null,
      furnished_status: 'Unfurnished',
      pet_policy: 'No Pets',
      address: '',
      latitude: null,
      longitude: null,
      amenities: [],
      rules: '',
      images: [],
    },
  });

  const watchLeaseType = watch("lease_type");
  const watchImages = watch("images");

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!userProfile || userProfile.role !== 'landlord' || !userProfile.is_verified) {
    return (
      <div className="container p-4 mx-auto text-center">
        <h1 className="mb-4 text-3xl font-bold text-darkText">Access Denied</h1>
        <p className="text-gray-600">You must be a verified landlord to create a listing.</p>
        <Link to="/landlord/dashboard" className="inline-block px-4 py-2 mt-4 text-white rounded-md bg-primary hover:bg-opacity-90">Go to Dashboard</Link>
        {/* Potentially add link/instructions for verification */}
      </div>
    );
  }

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const imageUrls: string[] = [];
    for (const file of files) {
      const filePath = `${userProfile!.id}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('property-images') // Ensure you have this bucket in Supabase Storage
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw new Error(`Failed to upload image ${file.name}: ${error.message}`);
      }
      const { data: publicUrlData } = supabase.storage.from('property-images').getPublicUrl(data.path);
      imageUrls.push(publicUrlData.publicUrl);
    }
    return imageUrls;
  };

  const onSubmit: SubmitHandler<ListingFormInputs> = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      let uploadedImageUrls: string[] = [];
      if (formData.images && formData.images.length > 0) {
        uploadedImageUrls = await uploadImages(formData.images);
      }

      const { images, ...propertyData } = formData; // Exclude File objects from DB payload

      const { data, error: dbError } = await supabase
        .from('properties')
        .insert({
          ...propertyData,
          landlord_id: userProfile.id,
          images: uploadedImageUrls,
        })
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      alert('Property listed successfully!');
      navigate('/landlord/dashboard');
    } catch (err: any) {
      console.error('Error creating listing:', err.message);
      setError('Failed to create listing: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-center text-darkText">
        List Your Property
      </h1>
      <div className="flex justify-center mb-8">
        <div className="flex items-center">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              step >= 1 ? 'bg-primary text-white' : 'bg-gray-300 text-gray-700'
            } font-bold`}
          >
            1
          </div>
          <div className="w-20 mx-2 border-t-2 border-gray-300"></div>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              step >= 2 ? 'bg-primary text-white' : 'bg-gray-300 text-gray-700'
            } font-bold`}
          >
            2
          </div>
          <div className="w-20 mx-2 border-t-2 border-gray-300"></div>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              step >= 3 ? 'bg-primary text-white' : 'bg-gray-300 text-gray-700'
            } font-bold`}
          >
            3
          </div>
        </div>
      </div>

      {error && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-md">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="p-8 bg-white rounded-lg shadow-xl">
        {step === 1 && (
          <section>
            <h2 className="mb-6 text-2xl font-semibold text-darkText">Basic Information</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-700">
                  Property Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
                  placeholder="e.g., Spacious 2-Bedroom Apartment"
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
                  placeholder="Tell us about your property..."
                ></textarea>
              </div>

              <div>
                <label htmlFor="property_type" className="block mb-1 text-sm font-medium text-gray-700">
                  Property Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="property_type"
                  {...register('property_type', { required: 'Property type is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
                >
                  {propertyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.property_type && <p className="mt-1 text-sm text-red-500">{errors.property_type.message}</p>}
              </div>

              <div>
                <label htmlFor="lease_type" className="block mb-1 text-sm font-medium text-gray-700">
                  Lease Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="lease_type"
                  {...register('lease_type', { required: 'Lease type is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
                >
                  {leaseTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.lease_type && <p className="mt-1 text-sm text-red-500">{errors.lease_type.message}</p>}
              </div>

              <div>
                <label htmlFor="price" className="block mb-1 text-sm font-medium text-gray-700">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="flex border border-gray-300 rounded-md">
                  <select
                    {...register('currency', { required: true })}
                    className="px-3 py-2 border-r border-gray-300 rounded-l-md bg-gray-50 focus:border-primary focus:ring-primary"
                  >
                    {currencies.map((curr) => (
                      <option key={curr} value={curr}>
                        {curr}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    id="price"
                    {...register('price', { required: 'Price is required', min: 0 })}
                    className="flex-grow px-3 py-2 rounded-r-md focus:border-primary focus:ring-primary"
                    placeholder="e.g., 15000"
                    step="any"
                  />
                </div>
                {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>}
              </div>

              <div>
                <label htmlFor="payment_frequency" className="block mb-1 text-sm font-medium text-gray-700">
                  Payment Frequency <span className="text-red-500">*</span>
                </label>
                <select
                  id="payment_frequency"
                  {...register('payment_frequency', { required: 'Payment frequency is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
                >
                  {paymentFrequencies
                    .filter(freq => {
                      if (watchLeaseType === 'short-term') return freq === 'per_night' || freq === 'per_week';
                      if (watchLeaseType === 'long-term' || watchLeaseType === 'student') return freq === 'per_month';
                      return true; // Default
                    })
                    .map((freq) => (
                      <option key={freq} value={freq}>
                        {freq.replace('_', ' ').charAt(0).toUpperCase() + freq.replace('_', ' ').slice(1)}
                      </option>
                    ))}
                </select>
                {errors.payment_frequency && <p className="mt-1 text-sm text-red-500">{errors.payment_frequency.message}</p>}
              </div>

              {/* Numerical inputs with optional validation */}
              <div>
                <label htmlFor="bedrooms" className="block mb-1 text-sm font-medium text-gray-700">
                  Bedrooms
                </label>
                <input
                  type="number"
                  id="bedrooms"
                  {...register('bedrooms', { min: 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
                  placeholder="e.g., 2"
                />
                {errors.bedrooms && <p className="mt-1 text-sm text-red-500">{errors.bedrooms.message}</p>}
              </div>
              <div>
                <label htmlFor="bathrooms" className="block mb-1 text-sm font-medium text-gray-700">
                  Bathrooms
                </label>
                <input
                  type="number"
                  id="bathrooms"
                  {...register('bathrooms', { min: 0, step: 0.5 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
                  placeholder="e.g., 1.5"
                />
                {errors.bathrooms && <p className="mt-1 text-sm text-red-500">{errors.bathrooms.message}</p>}
              </div>

              <div>
                <label htmlFor="furnished_status" className="block mb-1 text-sm font-medium text-gray-700">
                  Furnished Status
                </label>
                <select
                  id="furnished_status"
                  {...register('furnished_status')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
                >
                  {furnishedOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="pet_policy" className="block mb-1 text-sm font-medium text-gray-700">
                  Pet Policy
                </label>
                <select
                  id="pet_policy"
                  {...register('pet_policy')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
                >
                  {petPolicyOptions.map((policy) => (
                    <option key={policy} value={policy}>
                      {policy}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 font-semibold text-white transition duration-200 rounded-md bg-primary hover:bg-opacity-90"
              >
                Next
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h2 className="mb-6 text-2xl font-semibold text-darkText">Location & Media</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="address" className="block mb-1 text-sm font-medium text-gray-700">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  {...register('address', { required: 'Address is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
                  placeholder="e.g., Bole Medhanealem, Addis Ababa"
                />
                {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>}
                {/* Map integration for lat/lng (Sprint 2) */}
                <p className="mt-2 text-sm text-gray-500">
                  In Sprint 2, you'll be able to pinpoint the exact location on a map.
                </p>
              </div>

              {/* Image Uploader */}
              <div>
                <Controller
                  name="images"
                  control={control}
                  rules={{ validate: (value) => value.length > 0 || 'At least one image is required' }}
                  render={({ field }) => (
                    <ImageUploader
                      images={field.value}
                      onImagesChange={(newImages) => field.onChange(newImages)}
                      maxFiles={3} // MVP: Max 3 images
                    />
                  )}
                />
                {errors.images && <p className="mt-1 text-sm text-red-500">{errors.images.message}</p>}
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 font-semibold transition duration-200 bg-gray-300 rounded-md text-darkText hover:bg-gray-400"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 font-semibold text-white transition duration-200 rounded-md bg-primary hover:bg-opacity-90"
              >
                Next
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h2 className="mb-6 text-2xl font-semibold text-darkText">Amenities & Rules</h2>
            <div className="space-y-6">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Amenities</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {amenitiesOptions.map((amenity) => (
                    <div key={amenity} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`amenity-${amenity}`}
                        value={amenity}
                        {...register('amenities')}
                        className="w-4 h-4 border-gray-300 rounded text-primary focus:ring-primary"
                      />
                      <label htmlFor={`amenity-${amenity}`} className="ml-2 text-sm text-gray-700">
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="rules" className="block mb-1 text-sm font-medium text-gray-700">
                  House Rules
                </label>
                <textarea
                  id="rules"
                  {...register('rules')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
                  placeholder="e.g., No smoking indoors, Quiet hours after 10 PM."
                ></textarea>
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 font-semibold transition duration-200 bg-gray-300 rounded-md text-darkText hover:bg-gray-400"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex items-center justify-center px-6 py-2 font-semibold text-white transition duration-200 rounded-md bg-secondary hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? <Spinner /> : 'Submit Listing'}
              </button>
            </div>
          </section>
        )}
      </form>
    </div>
  );
};

export default CreateListing;