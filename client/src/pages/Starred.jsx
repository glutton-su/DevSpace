
import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { projectsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';

export const Starred = () => {
  const [starredProjects, setStarredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadStarredProjects = async () => {
      try {
        const { projects } = await projectsAPI.getProjects();
        const starred = projects.filter((p) => p.isStarred);
        setStarredProjects(starred);
      } catch (error) {
        console.error('Failed to load starred projects:', error);
        toast({
          title: 'Error',
          description: 'Failed to load starred projects',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStarredProjects();
  }, [toast]);

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center">
          <Star className="h-8 w-8 mr-3 text-yellow-500" />
          <div>
            <h1 className="text-3xl font-bold">Starred Projects</h1>
            <p className="text-muted-foreground">
              Projects you've starred ({starredProjects.length})
            </p>
          </div>
        </div>

        {starredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {starredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Star className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No starred projects yet</h3>
            <p className="text-muted-foreground">
              Star projects to see them here for quick access.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Starred;
