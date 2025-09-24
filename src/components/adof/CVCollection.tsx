import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Upload, X, Plus, ArrowLeft, ChevronRight, User, Mail, Phone, GraduationCap, Briefcase } from 'lucide-react';
import { api } from '@/lib/api';

interface SelectedJob {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  skills: string[];
}

interface CVData {
  name: string;
  email: string;
  phone: string;
  experience: string;
  skills: string[];
  education: string;
  file?: File;
}

interface CVCollectionProps {
  selectedJob: SelectedJob;
  onCVSubmit: (data: CVData) => void;
  onBack: () => void;
}

export const CVCollection: React.FC<CVCollectionProps> = ({ selectedJob, onCVSubmit, onBack }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<CVData>({
    name: '',
    email: '',
    phone: '',
    experience: '',
    skills: [],
    education: '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof CVData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a PDF or Word document.',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please upload a file smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }

      setUploadedFile(file);
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter your full name.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast({
        title: 'Valid Email Required',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.phone.trim()) {
      toast({
        title: 'Phone Required',
        description: 'Please enter your phone number.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.experience.trim()) {
      toast({
        title: 'Experience Required',
        description: 'Please describe your work experience.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.skills.length === 0) {
      toast({
        title: 'Skills Required',
        description: 'Please add at least one skill.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.education.trim()) {
      toast({
        title: 'Education Required',
        description: 'Please describe your educational background.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData object
      const formDataToSend = new FormData();
      
      // Add all form fields to FormData
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('experience', formData.experience);
      formDataToSend.append('education', formData.education);
      formDataToSend.append('skills', formData.skills.join(','));
      formDataToSend.append('jobId', selectedJob.id);
      formDataToSend.append('jobTitle', selectedJob.title);
      
      // Add file if present
      if (formData.file) {
        formDataToSend.append('cvFile', formData.file);
      }

      console.log('Submitting form data:', {
        ...formData,
        skills: formData.skills.join(','),
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        hasFile: !!formData.file
      });

      // Call the API
      const result = await api.submitUserData(formDataToSend);
      
      toast({
        title: 'CV Submitted Successfully!',
        description: result.message || 'Your information has been saved. Proceeding to assessment.',
      });

      // Call the parent's onCVSubmit with the form data
      onCVSubmit(formData);
    } catch (error) {
      console.error('Error submitting CV:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Job Context */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5" />
            <span>Selected Position</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{selectedJob.title}</h3>
            <p className="text-muted-foreground">{selectedJob.company}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedJob.skills.slice(0, 5).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {selectedJob.skills.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{selectedJob.skills.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CV Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Submit Your Information</span>
          </CardTitle>
          <CardDescription>
            Please provide your details and CV to proceed with the assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-4 h-4 text-primary" />
                <h3 className="text-lg font-semibold">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Briefcase className="w-4 h-4 text-primary" />
                <h3 className="text-lg font-semibold">Professional Information</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Work Experience *</Label>
                <Textarea
                  id="experience"
                  placeholder="Describe your relevant work experience, including job titles, companies, and key responsibilities..."
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Skills *</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  />
                  <Button type="button" onClick={handleAddSkill} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Education */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="w-4 h-4 text-primary" />
                <h3 className="text-lg font-semibold">Education</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Educational Background *</Label>
                <Textarea
                  id="education"
                  placeholder="Describe your educational background, including degrees, institutions, and relevant coursework..."
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Upload className="w-4 h-4 text-primary" />
                <h3 className="text-lg font-semibold">CV Upload (Optional)</h3>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="cv-upload"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="cv-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Click to upload your CV (PDF or Word document)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Maximum file size: 5MB
                  </p>
                </label>
                
                {uploadedFile && (
                  <div className="mt-4 p-3 bg-muted rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{uploadedFile.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setUploadedFile(null);
                        setFormData(prev => ({ ...prev, file: undefined }));
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
              
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Proceed to Assessment
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};