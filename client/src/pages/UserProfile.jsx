
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Link as LinkIcon, 
  Building, 
  Calendar,
  Star,
  GitFork,
  Users
} from 'lucide-react';

const UserProfile = () => {
  const { username } = useParams();

  // Mock user data - in a real app, this would come from an API
  const user = {
    id: '1',
    username: username || 'demouser',
    email: 'demo@devspace.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    name: 'Demo User',
    bio: 'Full-stack developer passionate about creating amazing web experiences. Love working with React, TypeScript, and modern web technologies.',
    location: 'San Francisco, CA',
    website: 'https://demouser.dev',
    company: 'DevSpace Inc.',
    joinedDate: '2023-01-15',
    followers: 142,
    following: 89,
    publicRepos: 24,
    stars: 156
  };

  const projects = [
    {
      id: '1',
      name: 'React Todo App',
      description: 'A modern todo application built with React and TypeScript',
      language: 'JavaScript',
      stars: 24,
      forks: 8,
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Vue Dashboard',
      description: 'Admin dashboard with charts and analytics',
      language: 'JavaScript',
      stars: 18,
      forks: 5,
      updatedAt: '2024-01-13'
    }
  ];

  const starredProjects = [
    {
      id: '3',
      name: 'awesome-react',
      description: 'A collection of awesome React resources',
      language: 'JavaScript',
      stars: 1200,
      owner: 'community'
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="flex flex-col items-center md:items-start">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback className="text-2xl">
                {user.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" className="w-full md:w-auto">
              Follow
            </Button>
          </div>

          <div className="flex-1">
            <div className="mb-4">
              <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
              <p className="text-xl text-muted-foreground mb-4">@{user.username}</p>
              <p className="text-muted-foreground mb-4">{user.bio}</p>
            </div>

            <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
              {user.company && (
                <div className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {user.company}
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {user.location}
                </div>
              )}
              {user.website && (
                <div className="flex items-center gap-1">
                  <LinkIcon className="h-4 w-4" />
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    {user.website.replace('https://', '')}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Joined {new Date(user.joinedDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </div>
            </div>

            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="font-semibold">{user.followers}</span> followers
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold">{user.following}</span> following
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span className="font-semibold">{user.stars}</span> stars
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <Tabs defaultValue="repositories" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="repositories">
              Repositories ({user.publicRepos})
            </TabsTrigger>
            <TabsTrigger value="starred">
              Starred
            </TabsTrigger>
            <TabsTrigger value="followers">
              Followers
            </TabsTrigger>
            <TabsTrigger value="following">
              Following
            </TabsTrigger>
          </TabsList>

          <TabsContent value="repositories" className="space-y-4">
            <div className="grid gap-4">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg mb-2">
                          <a href={`/projects/${project.id}`} className="hover:text-primary">
                            {project.name}
                          </a>
                        </CardTitle>
                        <p className="text-muted-foreground text-sm">
                          {project.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Badge variant="secondary">{project.language}</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {project.stars}
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork className="h-3 w-3" />
                          {project.forks}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Updated {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="starred" className="space-y-4">
            <div className="grid gap-4">
              {starredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg mb-2">
                      <a href={`/projects/${project.id}`} className="hover:text-primary">
                        {project.owner}/{project.name}
                      </a>
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">
                      {project.description}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="secondary">{project.language}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {project.stars}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="followers" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Followers list would be displayed here</p>
            </div>
          </TabsContent>

          <TabsContent value="following" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Following list would be displayed here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserProfile;
