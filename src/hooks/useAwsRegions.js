import { useState, useEffect } from 'react';

export function useAwsRegions() {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await fetch('/api/aws/regions');
        const data = await response.json();
        
        if (data.success) {
          setRegions(data.regions);
        } else {
          console.error('Failed to fetch regions:', data.error);
          // Fallback to a few common regions if API fails
          setRegions([
            { name: 'US East (N. Virginia)', value: 'us-east-1' },
            { name: 'US West (Oregon)', value: 'us-west-2' },
            { name: 'Europe (Ireland)', value: 'eu-west-1' },
            { name: 'Asia Pacific (Singapore)', value: 'ap-southeast-1' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching regions:', error);
        // Fallback to a few common regions if API fails
        setRegions([
          { name: 'US East (N. Virginia)', value: 'us-east-1' },
          { name: 'US West (Oregon)', value: 'us-west-2' },
          { name: 'Europe (Ireland)', value: 'eu-west-1' },
          { name: 'Asia Pacific (Singapore)', value: 'ap-southeast-1' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, []);

  return { regions, loading };
} 