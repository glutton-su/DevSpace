
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { projectsAPI } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { 
  Plus, 
  Star, 
  GitFork, 
  Users, 
  Code,
  TrendingUp,
  Clock
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuthStore();
  const [starredProjects, setStarredProjects] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [collaborativeProjects, setCollaborativeProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalStars: 0,
    totalForks: 0,
    collaborators: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const { projects } = await projectsAPI.getProjects();
        const starred = projects.filter((p) => p.isStarred);
        const recent = projects.slice(0, 3);
        const collaborative = projects.filter((p) => p.owner.username !== user?.username);

        setStarredProjects(starred);
        setRecentProjects(recent);
        setCollaborativeProjects(collaborative);

        setStats({
          totalProjects: projects.length,
          totalStars: projects.reduce((sum, p) => sum + p.stars, 0),
          totalForks: projects.reduce((sum, p) => sum + p.forks, 0),
          collaborators: 12 // Mock data
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-8">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.username}!</h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your projects today.
            </p>
          </div>
          <Button asChild>
            <Link to="/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStars}</div>
              <p className="text-xs text-muted-foreground">
                +12 from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Forks</CardTitle>
              <GitFork className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalForks}</div>
              <p className="text-xs text-muted-foreground">
                +5 from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collaborators</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.collaborators}</div>
              <p className="text-xs text-muted-foreground">
                +3 from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/projects/new">Create Project</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/explore">Explore Projects</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/collaborations">Join Collaboration</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/settings">Update Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
      <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Projects
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/projects">View all</Link>
            </Button>
          </div>
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>

        {/* Starred Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Starred Projects
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/starred">View all</Link>
            </Button>
          </div>
          <div className="space-y-4">
            {starredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </div>
        </div>

        {/* Collaborative Projects */}
        {collaborativeProjects.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Collaborative Projects
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/collaborations">View all</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collaborativeProjects.slice(0, 3).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}
    </Layout>
  );
};
