import { useQuery } from 'react-query';

const fetchRoutes = async (origin: string, destination: string) => {
  const res = await fetch(`/api/routes?origin=${origin}&destination=${destination}`);
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json();
};

export const useRoutes = (origin: string, destination: string) => {
  return useQuery(['routes', origin, destination], () => fetchRoutes(origin, destination), {
    enabled: !!origin && !!destination,
  });
};