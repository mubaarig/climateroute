import { useQuery } from '@tanstack/react-query';

const fetchRoutes = async (origin: string, destination: string) => {
  const res = await fetch(`/api/routes?origin=${origin}&destination=${destination}`);
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json();
};

export const useRoutes = (origin: string, destination: string) => {
  return useQuery({
    queryKey: ['routes', origin, destination],
    queryFn: () => fetchRoutes(origin, destination),
    enabled: Boolean(origin) && Boolean(destination),
  });
};
