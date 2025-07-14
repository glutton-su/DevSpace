import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, Users, Zap, Shield, ArrowRight, Star, TrendingUp } from 'lucide-react';
import { snippetAPI } from '../services/api';
import SnippetCard from '../components/features/SnippetCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home = () => {
  const [featuredSnippets, setFeaturedSnippets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedSnippets = async () => {
      try {
        const response = await snippetAPI.getSnippets();
        setFeaturedSnippets(response.data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching featured snippets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedSnippets();
  }, []);

  const features = [
    {
      icon: Code2,
      title: 'Code Sharing',
      description: 'Share and discover code snippets with syntax highlighting for 20+ programming languages.',
      color: 'text-primary-400'
    },
    {
      icon: Users,
      title: 'Real-time Collaboration',
      description: 'Collaborate with developers in real-time workspaces with live editing and chat.',
      color: 'text-secondary-400'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built with modern web technologies for optimal performance and user experience.',
      color: 'text-yellow-400'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your code is protected with enterprise-grade security and privacy controls.',
      color: 'text-green-400'
    }
  ];

  const stats = [
    { label: 'Code Snippets', value: '10,000+', icon: Code2 },
    { label: 'Active Developers', value: '5,000+', icon: Users },
    { label: 'Programming Languages', value: '20+', icon: Star },
    { label: 'Collaboration Sessions', value: '1,000+', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-dark-950 to-secondary-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in">
              Share Code,{' '}
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Collaborate
              </span>
              <br />& Build Together
            </h1>
            
            <p className="text-xl text-dark-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              DevSpace is the ultimate platform for developers to share code snippets, 
              collaborate in real-time, and build amazing projects together.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-3 flex items-center space-x-2 group"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/dashboard"
                className="btn-secondary text-lg px-8 py-3"
              >
                Explore Snippets
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map(({ label, value, icon: Icon }) => (
                <div key={label} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Icon className="h-6 w-6 text-primary-400 mr-2" />
                    <span className="text-2xl lg:text-3xl font-bold text-white">{value}</span>
                  </div>
                  <p className="text-dark-300 text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Everything You Need to Code Better
            </h2>
            <p className="text-xl text-dark-300 max-w-2xl mx-auto">
              Powerful features designed to enhance your development workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(({ icon: Icon, title, description, color }) => (
              <div key={title} className="card text-center group hover:scale-105 transition-transform duration-300">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full bg-dark-800 ${color}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
                <p className="text-dark-300 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Snippets Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Featured Code Snippets
              </h2>
              <p className="text-xl text-dark-300">
                Discover high-quality code snippets from our community
              </p>
            </div>
            <Link
              to="/dashboard"
              className="btn-primary flex items-center space-x-2"
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Loading featured snippets..." />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {featuredSnippets.map((snippet) => (
                <SnippetCard
                  key={snippet.id}
                  snippet={snippet}
                  onLike={() => snippetAPI.toggleLike(snippet.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-900/30 to-secondary-900/30">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Start Coding Together?
          </h2>
          <p className="text-xl text-dark-300 mb-8">
            Join thousands of developers who are already sharing and collaborating on DevSpace
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="btn-primary text-lg px-8 py-3 flex items-center space-x-2"
            >
              <span>Create Account</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="text-primary-400 hover:text-primary-300 font-medium"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;