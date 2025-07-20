import React from 'react';
import { useParams } from 'react-router-dom';
import Spinner from '../components/Spinner';

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // In Sprint 2, you'll fetch property details from Supabase here
  // const [property, setProperty] = useState<Property | null>(null);
  // const [loading, setLoading] = useState(true);
  // useEffect(() => {
  //   const fetchProperty = async () => {
  //     const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
  //     if (error) console.error(error);
  //     setProperty(data);
  //     setLoading(false);
  //   };
  //   fetchProperty();
  // }, [id]);

  // if (loading) return <Spinner />;
  // if (!property) return <div className="p-4 text-center">Property not found.</div>;

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-3xl font-bold text-darkText">Property Details (ID: {id})</h1>
      <p className="text-gray-700">This page will show detailed information about the property.</p>
      <div className="p-4 mt-8 bg-white rounded-lg shadow-md">
        <p className="text-xl font-semibold">Placeholder Content</p>
        <p className="text-gray-600">Images, description, amenities, landlord info, etc., will be displayed here in Sprint 2.</p>
      </div>
    </div>
  );
};

export default PropertyDetails;