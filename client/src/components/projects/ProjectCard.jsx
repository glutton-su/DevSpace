
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProjectStore } from '@/stores/projectStore';
import { Star, GitFork, Code, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const ProjectCard = ({ project }) => {
  const { starProject } = useProjectStore();

  const handleStar = (e) => {
    e.preventDefault();
    starProject(project.id);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={project.owner.avatar} />
              <AvatarFallback>{project.owner.username[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardDescription className="text-sm text-muted-foreground">
                {project.owner.username}
              </CardDescription>
              <CardTitle className="text-lg">
                <Link 
                  to={`/projects/${project.id}`}
                  className="hover:text-primary transition-colors"
                >
                  {project.name}
                </Link>
              </CardTitle>
            </div>
          </div>
          <Button
            variant={project.isStarred ? "default" : "outline"}
            size="sm"
            onClick={handleStar}
            className="ml-2"
          >
            <Star className={`h-4 w-4 mr-1 ${project.isStarred ? 'fill-current' : ''}`} />
            {project.stars}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {project.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {project.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {project.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{project.tags.length - 3}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Code className="h-3 w-3 mr-1" />
              {project.language}
            </div>
            <div className="flex items-center">
              <GitFork className="h-3 w-3 mr-1" />
              {project.forks}
            </div>
          </div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
