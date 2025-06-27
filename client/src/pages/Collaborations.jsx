
import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { projectsAPI } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, UserCheck } from 'lucide-react';

export const Collaborations = () => {
  const { user } = useAuthStore();
  const [collaborativeProjects, setCollaborativeProjects] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Mock invitations data
  const mockInvitations = [
    {
      id: '1',
      projectName: 'E-commerce Platform',
      inviter: {
        username: 'alice_dev',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'
      },
      role: 'Editor',
      invitedAt: '2024-01-16T10:00:00Z'
    },
    {
      id: '2',
      projectName: 'Mobile App Backend',
      inviter: {
        username: 'bob_backend',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'
      },
      role: 'Viewer',
      invitedAt: '2024-01-15T14:30:00Z'
    }
  ];

  useEffect(() => {
    const loadCollaborations = async () => {
      try {
        const { projects } = await projectsAPI.getProjects();
        const collaborative = projects.filter((p) => p.owner.username !== user?.username);
        setCollaborativeProjects(collaborative);
        setInvitations(mockInvitations);
      } catch (error) {
        console.error('Failed to load collaborations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load collaborations',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCollaborations();
  }, [user, toast]);

  const handleAcceptInvitation = (invitationId) => {
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    toast({
      title: 'Invitation Accepted',
      description: 'You are now a collaborator on this project',
    });
  };

  const handleDeclineInvitation = (invitationId) => {
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    toast({
      title: 'Invitation Declined',
      description: 'The invitation has been declined',
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
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
        <div className="flex items-center">
          <Users className="h-8 w-8 mr-3 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold">Collaborations</h1>
            <p className="text-muted-foreground">
              Projects you're collaborating on and invitations
            </p>
          </div>
        </div>

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Pending Invitations ({invitations.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invitations.map((invitation) => (
                <Card key={invitation.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{invitation.projectName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={invitation.inviter.avatar} />
                          <AvatarFallback>
                            {invitation.inviter.username[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{invitation.inviter.username}</p>
                          <Badge variant="secondary" className="text-xs">
                            {invitation.role}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleAcceptInvitation(invitation.id)}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeclineInvitation(invitation.id)}
                      >
                        Decline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Collaborative Projects */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Collaborative Projects ({collaborativeProjects.length})
          </h2>
          
          {collaborativeProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collaborativeProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No collaborations yet</h3>
              <p className="text-muted-foreground">
                You'll see projects you're collaborating on here once you join some teams.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Collaborations;
