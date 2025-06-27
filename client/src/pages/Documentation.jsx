
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Code, 
  Users, 
  Zap, 
  Shield, 
  Globe,
  MessageSquare,
  Heart
} from 'lucide-react';

export const Documentation = () => {
  const sections = [
    {
      title: 'Getting Started',
      icon: <Zap className="h-5 w-5" />,
      items: [
        'Creating your first project',
        'Understanding the interface',
        'Basic project structure',
        'Inviting collaborators'
      ]
    },
    {
      title: 'Code Editor',
      icon: <Code className="h-5 w-5" />,
      items: [
        'Real-time collaboration',
        'Syntax highlighting',
        'Auto-completion',
        'Version control integration'
      ]
    },
    {
      title: 'Collaboration',
      icon: <Users className="h-5 w-5" />,
      items: [
        'Managing team members',
        'Role-based permissions',
        'Comments and reviews',
        'Live cursors and presence'
      ]
    },
    {
      title: 'Security',
      icon: <Shield className="h-5 w-5" />,
      items: [
        'Authentication methods',
        'Project privacy settings',
        'API security',
        'Data encryption'
      ]
    }
  ];

  const apiEndpoints = [
    { method: 'GET', endpoint: '/api/projects', description: 'List all projects' },
    { method: 'POST', endpoint: '/api/projects', description: 'Create a new project' },
    { method: 'GET', endpoint: '/api/projects/:id', description: 'Get project details' },
    { method: 'PUT', endpoint: '/api/projects/:id', description: 'Update project' },
    { method: 'DELETE', endpoint: '/api/projects/:id', description: 'Delete project' },
    { method: 'POST', endpoint: '/api/projects/:id/star', description: 'Star/unstar project' },
    { method: 'POST', endpoint: '/api/projects/:id/fork', description: 'Fork project' },
    { method: 'GET', endpoint: '/api/code/:projectId', description: 'Get code snippets' },
    { method: 'POST', endpoint: '/api/code', description: 'Create code snippet' },
    { method: 'PUT', endpoint: '/api/code/:id', description: 'Update code snippet' },
  ];

  const getMethodBadgeVariant = (method) => {
    switch (method) {
      case 'GET':
        return 'secondary';
      case 'POST':
        return 'default';
      case 'PUT':
        return 'outline';
      case 'DELETE':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-8">
        <div className="flex items-center">
          <BookOpen className="h-8 w-8 mr-3 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold">Documentation</h1>
            <p className="text-muted-foreground">
              Learn how to make the most of DevSpace
            </p>
          </div>
        </div>

        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-500" />
              Quick Start Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>Welcome to DevSpace! Here's how to get started:</p>
            <ol>
              <li><strong>Create your first project</strong> - Click the "New Project" button on your dashboard</li>
              <li><strong>Invite collaborators</strong> - Share your project with team members using their email or username</li>
              <li><strong>Start coding</strong> - Use our real-time code editor to write and edit code together</li>
              <li><strong>Organize with snippets</strong> - Break your code into manageable snippets for better organization</li>
              <li><strong>Share and discover</strong> - Make your projects public to share with the community</li>
            </ol>
          </CardContent>
        </Card>

        {/* Documentation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {section.icon}
                  <span className="ml-2">{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full mr-3"></div>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* API Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-green-500" />
              API Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              DevSpace provides a RESTful API for programmatic access to your projects and data.
              All API requests require authentication via JWT tokens.
            </p>
            <div className="space-y-3">
              {apiEndpoints.map((endpoint, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={getMethodBadgeVariant(endpoint.method)}>
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono">{endpoint.endpoint}</code>
                  </div>
                  <span className="text-sm text-muted-foreground">{endpoint.description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Socket.io Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-purple-500" />
              Real-time Events (Socket.io)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              DevSpace uses Socket.io for real-time collaboration features.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Client Events (Send)</h4>
                <ul className="space-y-1 text-sm">
                  <li><code>join-project</code> - Join a project room</li>
                  <li><code>leave-project</code> - Leave a project room</li>
                  <li><code>code-change</code> - Send code changes</li>
                  <li><code>cursor-change</code> - Send cursor position</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Server Events (Receive)</h4>
                <ul className="space-y-1 text-sm">
                  <li><code>code-update</code> - Receive code changes</li>
                  <li><code>cursor-update</code> - Receive cursor positions</li>
                  <li><code>user-joined</code> - User joined project</li>
                  <li><code>user-left</code> - User left project</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-500" />
              Support & Community
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <h4 className="font-semibold">Community Forum</h4>
                <p className="text-sm text-muted-foreground">
                  Get help from other developers
                </p>
              </div>
              <div className="text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <h4 className="font-semibold">Knowledge Base</h4>
                <p className="text-sm text-muted-foreground">
                  Browse our comprehensive guides
                </p>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <h4 className="font-semibold">Discord Community</h4>
                <p className="text-sm text-muted-foreground">
                  Join our active Discord server
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Documentation;
