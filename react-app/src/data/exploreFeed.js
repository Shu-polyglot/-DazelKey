/*
  Explore feed seed data -- other accounts' completed Buckets, shaped like
  this app's own achievement Buckets (title/place/mode/completedDate) plus
  the author info a local Bucket doesn't need. `inspiredCount` is the
  baseline count from "everyone else"; the current user's own toggle is
  layered on top by useExploreFeed, not baked in here.
*/

export const exploreFeedSeed = [
  {
    id: 'exp-1',
    user: { name: 'Mika Tanaka', handle: '@mika.explores', avatar: 'https://i.pravatar.cc/150?img=47' },
    title: 'Swam with whale sharks at dawn',
    place: 'Cebu, Philippines',
    mode: 'solo',
    completedDate: '2026-05-02',
    image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=900&q=80',
    inspiredCount: 128,
  },
  {
    id: 'exp-2',
    user: { name: 'Noah Bergström', handle: '@noahb', avatar: 'https://i.pravatar.cc/150?img=12' },
    title: 'Chased the Northern Lights above the Arctic Circle',
    place: 'Tromsø, Norway',
    mode: 'together',
    completedDate: '2026-01-18',
    image: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=900&q=80',
    inspiredCount: 342,
  },
  {
    id: 'exp-3',
    user: { name: 'Aiko Fujimori', handle: '@aiko.f', avatar: 'https://i.pravatar.cc/150?img=32' },
    title: 'Ran my first marathon',
    place: 'Tokyo, Japan',
    mode: 'solo',
    completedDate: '2026-03-01',
    image: 'https://images.unsplash.com/photo-1452626212852-811d58933cae?w=900&q=80',
    inspiredCount: 96,
  },
  {
    id: 'exp-4',
    user: { name: 'Leo Martins', handle: '@leo.wanders', avatar: 'https://i.pravatar.cc/150?img=15' },
    title: 'Hiked into the clouds above Machu Picchu',
    place: 'Cusco, Peru',
    mode: 'together',
    completedDate: '2025-11-22',
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=900&q=80',
    inspiredCount: 511,
  },
  {
    id: 'exp-5',
    user: { name: 'Priya Nair', handle: '@priya.n', avatar: 'https://i.pravatar.cc/150?img=25' },
    title: 'Launched my first product',
    place: 'Bengaluru, India',
    mode: 'solo',
    completedDate: '2026-04-09',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80',
    inspiredCount: 203,
  },
  {
    id: 'exp-6',
    user: { name: 'Ethan Cole', handle: '@ethan.cole', avatar: 'https://i.pravatar.cc/150?img=8' },
    title: 'Learned to surf on a black-sand beach',
    place: 'Vík, Iceland',
    mode: 'together',
    completedDate: '2025-09-14',
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=900&q=80',
    inspiredCount: 74,
  },
];
