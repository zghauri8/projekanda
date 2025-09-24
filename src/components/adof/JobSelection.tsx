import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Briefcase, Search, MapPin, Clock, DollarSign, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  skills: string[];
}

interface JobSelectionProps {
  onJobSelect: (job: Job) => void;
}

export const JobSelection: React.FC<JobSelectionProps> = ({ onJobSelect }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { key: 'all', label: 'All Jobs' },
    { key: 'technology', label: 'Technology' },
    { key: 'marketing', label: 'Marketing' },
    { key: 'business', label: 'Business' },
    { key: 'design', label: 'Design' },
    { key: 'sales', label: 'Sales' }
  ];

  useEffect(() => {
    let isMounted = true;
    
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const data = await api.getJobs();
        if (isMounted) {
          setJobs(data);
          setError(null);
        }
      } catch (err) {
        const error = err as Error;
        console.error('Failed to fetch jobs:', error);
        console.error('Error details:', {
          name: error?.name,
          message: error?.message,
          stack: error?.stack,
          response: (error as any)?.response
        });
        
        if (isMounted) {
          const errorMessage = error?.message || 'Failed to load jobs. Please try again later.';
          console.error('Setting error state with message:', errorMessage);
          setError(errorMessage);
          
          try {
            toast({
              title: 'Error',
              description: errorMessage,
              variant: 'destructive',
            });
          } catch (toastError) {
            console.error('Failed to show toast:', toastError);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchJobs();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []); // Removed toast from dependencies

  const filteredJobs = jobs.filter(job => {
    // Handle cases where skills might be undefined
    const jobSkills = job.skills || [];
    const jobTitle = job.title?.toLowerCase() || '';
    const companyName = job.company?.toLowerCase() || '';
    
    const matchesSearch = jobTitle.includes(searchTerm.toLowerCase()) ||
                         companyName.includes(searchTerm.toLowerCase()) ||
                         jobSkills.some(skill => skill?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (selectedCategory === 'all') return matchesSearch;
    
    // Simple category matching based on job title/skills
    const categoryMatch = {
      technology: ['software', 'developer', 'data', 'analyst', 'engineer', 'programming', 'code'],
      marketing: ['marketing', 'seo', 'social', 'content', 'digital', 'advertising'],
      business: ['project', 'manager', 'business', 'management', 'strategy', 'operations'],
      design: ['designer', 'ux', 'ui', 'user experience', 'graphic', 'creative'],
      sales: ['sales', 'representative', 'account manager', 'business development', 'bdr', 'sdr']
    };
    
    const keywords = categoryMatch[selectedCategory as keyof typeof categoryMatch] || [];
    const matchesCategory = keywords.some(keyword => 
      jobTitle.includes(keyword) || 
      jobSkills.some(skill => skill?.toLowerCase().includes(keyword))
    );
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5" />
            <span>Available Positions</span>
          </CardTitle>
          <CardDescription>
            Select a job position to begin your assessment process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search jobs by title, company, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={`cat-${category.key}`}
                variant={selectedCategory === category.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.key)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading and Error States */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Loading jobs...</span>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 p-4 rounded-md flex items-center text-destructive">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto"
            onClick={async () => {
              try {
                setIsLoading(true);
                setError(null);
                const data = await api.getJobs();
                setJobs(data);
              } catch (err) {
                console.error('Failed to fetch jobs:', err);
                setError('Failed to load jobs. Please try again.');
              } finally {
                setIsLoading(false);
              }
            }}
          >
            Retry
          </Button>
        </div>
      ) : (
        /* Job Listings */
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No jobs found matching your criteria.</p>
              <Button 
                variant="ghost" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onJobSelect(job)}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{job.title || 'No Title'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {job.company || 'Company not specified'} • {job.location || 'Location not specified'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.type && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" /> {job.type}
                        </Badge>
                      )}
                      {job.salary && (
                        <Badge variant="secondary" className="text-xs">
                          <DollarSign className="w-3 h-3 mr-1" /> {job.salary}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {job.description && (
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>
                  )}
                  
                  {job.skills && job.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.skills.slice(0, 5).map((skill, index) => (
                        <Badge 
                          key={`${job.id}-skill-${index}`} 
                          variant="secondary" 
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {job.skills.length > 5 && (
                        <Badge 
                          key={`${job.id}-more`} 
                          variant="outline" 
                          className="text-xs"
                        >
                          +{job.skills.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <Button variant="ghost" size="sm" className="text-primary">
                      View Details <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Stats */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <div className="flex justify-center items-center space-x-8 text-sm text-muted-foreground">
            <div className="text-center">
              <div className="font-semibold text-foreground">{jobs.length}</div>
              <div>Total Jobs</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-foreground">{filteredJobs.length}</div>
              <div>Matching Jobs</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-foreground">{categories.length - 1}</div>
              <div>Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};