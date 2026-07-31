export interface ObsessionMovie {
  title: string;
  quote: string;
  gradient: string;
}

export const OBSESSION_POOL: ObsessionMovie[] = [
  {
    title: 'Whiplash (2014)',
    quote: 'Raw intensity & relentless perfectionism.',
    gradient: 'from-amber-950 to-black',
  },
  {
    title: 'Interstellar (2014)',
    quote: 'Nolan’s breathtaking cosmic emotional masterpiece.',
    gradient: 'from-blue-950 to-slate-950',
  },
  {
    title: 'Gangs of Wasseypur (2012)',
    quote: 'Definitive Indian crime epic.',
    gradient: 'from-amber-900 to-black',
  },
  {
    title: 'Pulp Fiction (1994)',
    quote: 'Tarantino non-linear crime perfection.',
    gradient: 'from-rose-950 to-black',
  },
  {
    title: 'Kumbalangi Nights (2019)',
    quote: 'Malayalam cinema pure warmth.',
    gradient: 'from-blue-900 to-black',
  },
  {
    title: 'The Dark Knight (2008)',
    quote: 'Heath Ledger peak legendary performance.',
    gradient: 'from-zinc-900 to-black',
  },
  {
    title: 'Tumbbad (2018)',
    quote: 'Unmatched atmospheric mythic horror.',
    gradient: 'from-red-950 to-black',
  },
  {
    title: 'Everything Everywhere All at Once (2022)',
    quote: 'Chaotic, heartbreaking multiverse genius.',
    gradient: 'from-fuchsia-950 to-black',
  },
  {
    title: 'Aavesham (2024)',
    quote: 'Fahadh Faasil peak unhinged energy.',
    gradient: 'from-amber-800 to-slate-950',
  },
  {
    title: 'Parasite (2019)',
    quote: 'Bong Joon-ho masterclass in tension & satire.',
    gradient: 'from-emerald-950 to-black',
  },
  {
    title: 'Fight Club (1999)',
    quote: 'David Fincher mind-bending cult classic.',
    gradient: 'from-slate-900 to-black',
  },
  {
    title: 'La La Land (2016)',
    quote: 'Bittersweet romantic cinematic poetry.',
    gradient: 'from-purple-900 to-black',
  },
  {
    title: 'RRR (2022)',
    quote: 'SS Rajamouli maximalist glory.',
    gradient: 'from-orange-900 to-black',
  },
  {
    title: 'Drive (2011)',
    quote: 'Neon-soaked synthwave neo-noir perfection.',
    gradient: 'from-pink-950 to-slate-950',
  }
];

export function getRandomObsessions(count = 3): ObsessionMovie[] {
  const shuffled = [...OBSESSION_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

