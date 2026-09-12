export type Project = {
  title: string;
  description: string;
  tags: string[];
  type: string;
  gradient: string;
  liveUrl: string;
  repoUrl: string;
  repoName?: string;
};

export const mockProjects: Project[] = [
  { title: 'Luma Finance', description: 'A calm, conversational dashboard for making sense of everyday money.', tags: ['Next.js', 'TypeScript', 'tRPC'], type: 'Fintech / Product', gradient: 'from-[#2f6fed] via-[#694fe9] to-[#a052e7]', liveUrl: '#', repoUrl: '#', repoName: 'luma-finance' },
  { title: 'Field Notes', description: 'An offline-first notes app designed for thinking in the messy middle.', tags: ['React', 'IndexedDB', 'Framer Motion'], type: 'Web app / Open source', gradient: 'from-[#22684d] via-[#3f9b70] to-[#a6c63c]', liveUrl: '#', repoUrl: '#', repoName: 'field-notes' },
  { title: 'Arcade Radio', description: 'A tiny radio player with big album art, built for late-night focus.', tags: ['React Native', 'Expo', 'NativeWind'], type: 'Mobile / Side project', gradient: 'from-[#ee8354] via-[#df4c67] to-[#9b4cdf]', liveUrl: '#', repoUrl: '#', repoName: 'arcade-radio' },
];

export const skills = [
  { label: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'CSS / Tailwind', 'Accessibility', 'Design systems'] },
  { label: 'Backend', items: ['Node.js', 'Postgres', 'tRPC', 'REST APIs', 'Prisma', 'Auth'] },
  { label: 'Tools / DevOps', items: ['Git / GitHub', 'Figma', 'Vercel', 'Docker', 'CI / CD', 'Storybook'] },
];

type GitHubRepo = { name: string; description: string | null; html_url: string; homepage: string | null; language: string | null; topics?: string[] };

export async function fetchGithubProjects(username: string): Promise<Project[]> {
  const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
  if (!response.ok) throw new Error('Could not load GitHub repositories');
  const repos = (await response.json()) as GitHubRepo[];
  return repos.filter((repo) => !repo.name.startsWith('.')).slice(0, 3).map((repo, index) => ({
    title: repo.name.replace(/[-_]/g, ' '), description: repo.description || 'A work in progress from the public code shelf.', tags: [...(repo.topics || []), ...(repo.language ? [repo.language] : [])].slice(0, 3), type: 'GitHub repository', gradient: ['from-[#2f6fed] via-[#694fe9] to-[#a052e7]', 'from-[#22684d] via-[#3f9b70] to-[#a6c63c]', 'from-[#ee8354] via-[#df4c67] to-[#9b4cdf]'][index % 3], liveUrl: repo.homepage || '#', repoUrl: repo.html_url,
  })) as Project[];
}
