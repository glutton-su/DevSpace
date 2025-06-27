
import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { projectsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  Search, 
  Filter,
  Star
} from 'lucide-react';

export const Explore = () => {
  const [projects, setProjects] = useState([]);
  const [trendingProjects, setTrendingProjects] = useState([]);
  const [popularProjects, setPopularProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('stars');
  const { toast } = useToast();

  const languages = ['JavaScript', 'Python', 'TypeScript', 'Java', 'Go', 'Rust'];
  const tags = ['React', 'Vue', 'Angular', 'Frontend', 'Backend', 'Mobile', 'Web', 'API'];

  useEffect(() => {
    const loadExploreData = async () => {
      try {
        const { projects } = await projectsAPI.getProjects();
        setProjects(projects);
        
        // Sort for trending (by recent activity and stars)
        const trending = [...projects]
          .sort((a, b) => {
            const aScore = a.stars + (new Date(a.updatedAt).getTime() / 1000000000);
            const bScore = b.stars + (new Date(b.updatedAt).getTime() / 1000000000);
            return bScore - aScore;
          })
          .slice(0, 6);

        setTrendingProjects(trending);

        // Sort for most popular (by stars)
        const popular = [...projects]
          .sort((a, b) => b.stars - a.stars)
          .slice(0, 6);

        setPopularProjects(popular);
      } catch (error) {
        console.error('Failed to load explore data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load projects',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadExploreData();
  }, [toast]);
  const getFilteredAndSortedProjects = () => {
    let filtered = projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLanguage =
        selectedLanguage === 'all' || project.language === selectedLanguage;
      const matchesTag =
        selectedTag === 'all' || (project.tags && project.tags.includes(selectedTag));
      return matchesSearch && matchesLanguage && matchesTag;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'stars':
          return b.stars - a.stars;
        case 'forks':
          return b.forks - a.forks;
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
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
          <TrendingUp className="h-8 w-8 mr-3 text-green-500" />
          <div>
            <h1 className="text-3xl font-bold">Explore Projects</h1>
            <p className="text-muted-foreground">
              Discover amazing projects from the community
            </p>
          </div>
        </div>

        <Tabs defaultValue="trending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="popular">Most Popular</TabsTrigger>
            <TabsTrigger value="search">Search & Filter</TabsTrigger>
          </TabsList>

          <TabsContent value="trending" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Trending Now
              </h2>
              <Badge variant="secondary">Updated recently</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
            <div className="flex items-center justify-between mt-8">
              <h2 className="text-xl font-semibold flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Most Popular
              </h2>
              <Badge variant="secondary">Most starred</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            {/* Search and Filter Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Search & Filter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tags</SelectItem>
                      {tags.map((tag) => (
                        <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stars">Most Stars</SelectItem>
                      <SelectItem value="forks">Most Forks</SelectItem>
                      <SelectItem value="updated">Recently Updated</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredAndSortedProjects().length > 0 ? (
                getFilteredAndSortedProjects().map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or filters.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Explore;
