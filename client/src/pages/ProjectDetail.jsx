
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { CodeEditor } from '@/components/editor/CodeEditor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { projectsAPI } from '@/lib/api';
import { useProjectStore } from '@/stores/projectStore';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Star,
  GitFork,
  Code,
  Eye,
  Users,
  Calendar,
  Share,
  Download,
  Edit,
  Settings,
  Play,
  Plus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('code');
  const { starProject } = useProjectStore();
  const { toast } = useToast();

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;
      
      try {
        const projectData = await projectsAPI.getProject(id);
        setProject(projectData);
      } catch (error) {
        console.error('Failed to load project:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [id, toast]);

  const handleStar = async () => {
    if (!project) return;
    
    try {
      await projectsAPI.starProject(project.id);
      starProject(project.id);
      setProject({
        ...project,
        isStarred: !project.isStarred,
        stars: project.isStarred ? project.stars - 1 : project.stars + 1
      });
      toast({
        title: project.isStarred ? 'Unstarred' : 'Starred',
        description: `Project has been ${project.isStarred ? 'removed from' : 'added to'} your stars`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update star status',
        variant: 'destructive',
      });
    }
  };

  const handleFork = async () => {
    if (!project) return;
    
    try {
      await projectsAPI.forkProject(project.id);
      toast({
        title: 'Forked',
        description: 'Project has been forked to your account',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fork project',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Layout showSidebar={false}>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout showSidebar={false}>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <p className="text-muted-foreground mb-4">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/projects">Browse Projects</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const readmeSnippet = project.snippets?.find((s) => s.name.toLowerCase() === 'readme.md');

  return (
    <Layout showSidebar={false}>
      <div className="min-h-screen">
        {/* Project Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={project.owner.avatar} />
                  <AvatarFallback>{project.owner.username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
                    <Link to={`/users/${project.owner.username}`} className="hover:text-primary">
                      {project.owner.username}
                    </Link>
                    <span>/</span>
                  </div>
                  <h1 className="text-2xl font-bold">{project.name}</h1>
                  <p className="text-muted-foreground mt-1">{project.description}</p>
                  
                  <div className="flex items-center space-x-4 mt-3">
                    <div className="flex items-center space-x-1">
                      <Code className="h-4 w-4" />
                      <span className="text-sm">{project.language}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Watch
                </Button>
                
                <Button 
                  variant={project.isStarred ? "default" : "outline"} 
                  size="sm"
                  onClick={handleStar}
                >
                  <Star className={`h-4 w-4 mr-2 ${project.isStarred ? 'fill-current' : ''}`} />
                  Star ({project.stars})
                </Button>
                
                <Button variant="outline" size="sm" onClick={handleFork}>
                  <GitFork className="h-4 w-4 mr-2" />
                  Fork ({project.forks})
                </Button>
                
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                
                <Button variant="default" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Run Project
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Project Content */}
        <div className="container mx-auto px-6 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="code">Code ({project.snippets?.length || 0})</TabsTrigger>
              <TabsTrigger value="readme">README</TabsTrigger>
              <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="code" className="mt-6">
              {project.snippets && project.snippets.length > 0 ? (
                <div className="h-[70vh] border rounded-lg overflow-hidden">
                  <CodeEditor projectId={project.id} snippets={project.snippets} />
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No code snippets yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by adding your first code snippet to this project.
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Snippet
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="readme" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    README.md
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {readmeSnippet ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {readmeSnippet.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">
                        No README file found for this project.
                      </p>
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add README
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="collaborators" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Collaborators (3)
                    </div>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Invite
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { username: 'alice', role: 'Owner', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice' },
                      { username: 'bob',  role: 'Editor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob' },
                      { username: 'carol', role: 'Viewer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol' }
                    ].map((collaborator) => (
                      <div key={collaborator.username} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={collaborator.avatar} />
                            <AvatarFallback>{collaborator.username[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{collaborator.username}</p>
                            <p className="text-sm text-muted-foreground">{collaborator.role}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Project Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">General</h4>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export Project
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Danger Zone</h4>
                      <div className="space-y-2">
                        <Button variant="destructive" size="sm">
                          Archive Project
                        </Button>
                        <Button variant="destructive" size="sm">
                          Delete Project
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetail;
