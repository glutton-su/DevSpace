
import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { projectsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Clock, Eye, Edit, GitCommit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const Recent = () => {
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Mock recent activity data
  const mockActivity = [
    {
      id: '1',
      type: 'edit',
      projectName: 'React Todo App',
      action: 'Updated App.jsx',
      timestamp: '2024-01-16T14:30:00Z'
    },
    {
      id: '2',
      type: 'view',
      projectName: 'Python Web Scraper',
      action: 'Viewed project',
      timestamp: '2024-01-16T12:15:00Z'
    },
    {
      id: '3',
      type: 'commit',
      projectName: 'Vue Dashboard',
      action: 'Committed changes',
      timestamp: '2024-01-16T10:45:00Z'
    },
    {
      id: '4',
      type: 'edit',
      projectName: 'React Todo App',
      action: 'Added new component',
      timestamp: '2024-01-15T16:20:00Z'
    },
    {
      id: '5',
      type: 'view',
      projectName: 'Mobile App Backend',
      action: 'Viewed project',
      timestamp: '2024-01-15T11:30:00Z'
    }
  ];

  useEffect(() => {
    const loadRecentData = async () => {
      try {
        const { projects } = await projectsAPI.getProjects();
        // Sort by updatedAt and take the 6 most recent
        const recent = [...projects]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 6);
        
        setRecentProjects(recent);
        setRecentActivity(mockActivity);
      } catch (error) {
        console.error('Failed to load recent data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load recent activity',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentData();
  }, [toast]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'edit':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'view':
        return <Eye className="h-4 w-4 text-green-500" />;
      case 'commit':
        return <GitCommit className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityBadgeVariant = (type) => {
    switch (type) {
      case 'edit':
        return 'default';
      case 'view':
        return 'secondary';
      case 'commit':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-48 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
              <div className="h-96 bg-muted rounded"></div>
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
          <Clock className="h-8 w-8 mr-3 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold">Recent Activity</h1>
            <p className="text-muted-foreground">
              Your recently viewed and modified projects
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Recently Updated Projects</h2>
            {recentProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No recent projects</h3>
                <p className="text-muted-foreground">
                  Start working on projects to see them here.
                </p>
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant={getActivityBadgeVariant(activity.type)} className="text-xs">
                            {activity.type}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{activity.projectName}</p>
                        <p className="text-sm text-muted-foreground">{activity.action}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Recent;
