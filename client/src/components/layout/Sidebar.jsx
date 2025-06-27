
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  FolderOpen,
  Star,
  Users,
  Clock,
  BookOpen,
  Settings,
  TrendingUp,
} from 'lucide-react';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'My Projects',
    href: '/projects',
    icon: FolderOpen,
  },
  {
    title: 'Starred',
    href: '/starred',
    icon: Star,
  },
  {
    title: 'Collaborations',
    href: '/collaborations',
    icon: Users,
  },
  {
    title: 'Recent',
    href: '/recent',
    icon: Clock,
  },
  {
    title: 'Explore',
    href: '/explore',
    icon: TrendingUp,
  },
  {
    title: 'Documentation',
    href: '/docs',
    icon: BookOpen,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="pb-12 w-64">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors',
                  location.pathname === item.href
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
