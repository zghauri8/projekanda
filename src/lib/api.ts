const API_BASE_URL = 'https://projekanda.top';

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role: 'TVET' | 'ADOF';
}

export interface SigninData {
  email: string;
  password: string;
}

export interface TestQuestion {
  question: string;
  question_no: number;
  trait: string;
  options: {
    score: number;
    text: string;
  }[];
}

export interface GenerateTestResponse {
  mcqs_id?: string;
  document_id?: string;
  documentId?: string;
  id?: string;
  _id?: string;
  message: string;
  questions: TestQuestion[];
  trait?: string;
}

export interface GetMcqsResponse {
  mcqs_id?: string;
  document_id?: string;
  questions: TestQuestion[];
  message?: string;
}

export interface SubmitAnswersData {
  user_id: string;
  mcq_id: string;
  answers: Record<string, string>;
}

export interface SubmitAnswersResponse {
  data: {
    analysis: Record<string, string>;
    max_score: number;
    mcq_id: string;
    percentage: number;
    result_id: string;
    total_score: number;
    user_id: string;
  };
  message: string;
}

export interface TestResult {
  data: {
    analysis: Record<string, string>;
    max_score: number;
    mcq_id: string;
    percentage: number;
    result_id: string;
    total_score: number;
    user_id: string;
  };
  message: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  skills: string[];
  category?: string;
}

export const api = {
  async signup(data: SignupData) {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Signup failed');
    }

    return response.json();
  },

  async signin(data: SigninData) {
    const response = await fetch(`${API_BASE_URL}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Signin failed');
    }

    return response.json();
  },

  async generateTest(userId: string): Promise<GenerateTestResponse> {
    console.log('Generating test for user:', userId);
    
    const response = await fetch(`${API_BASE_URL}/generate_test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Test generation failed');
    }

    const result = await response.json();
    console.log('Generate test API response:', result);
    return result;
  },

  async getMcqs(userId: string): Promise<GetMcqsResponse> {
    console.log('Getting MCQs for user:', userId);
    
    const response = await fetch(`${API_BASE_URL}/get_mcqs/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();
    
    console.log('=== GET MCQS DEBUG ===');
    console.log('URL:', `${API_BASE_URL}/get_mcqs/${userId}`);
    console.log('Status:', response.status);
    console.log('Response:', responseText);
    console.log('=====================');

    if (!response.ok) {
      let errorMessage = 'Failed to get MCQs';
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    try {
      const result = JSON.parse(responseText);
      console.log('Get MCQs API response:', result);
      return result;
    } catch (error) {
      console.error('Failed to parse MCQs response:', responseText);
      throw new Error('Invalid response format from server');
    }
  },

  async submitAnswers(data: SubmitAnswersData): Promise<SubmitAnswersResponse> {
    const url = `${API_BASE_URL}/submit_answers`;
    const requestBody = JSON.stringify(data);
    
    console.log('=== API SUBMIT DEBUG ===');
    console.log('URL:', url);
    console.log('Method: POST');
    console.log('Headers:', { 'Content-Type': 'application/json' });
    console.log('Request data object:', data);
    console.log('Request body string:', requestBody);
    console.log('Request body length:', requestBody.length);
    console.log('========================');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    // Read the response body once
    const responseText = await response.text();
    
    console.log('=== API RESPONSE DEBUG ===');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response body:', responseText);
    console.log('Response length:', responseText.length);
    console.log('==========================');
    
    if (!response.ok) {
      let errorMessage = 'Answer submission failed';
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = responseText || errorMessage;
      }
      console.error('API Error Response:', responseText);
      throw new Error(errorMessage);
    }

    try {
      return JSON.parse(responseText);
    } catch (error) {
      console.error('Failed to parse response:', responseText);
      throw new Error('Invalid response format from server');
    }
  },

  async getJobs(): Promise<Job[]> {
    console.log('Making request to:', `${API_BASE_URL}/jobs`);
    try {
      const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch jobs: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Received jobs data:', data);
      
      if (!Array.isArray(data)) {
        console.error('Invalid response format: Expected array but got', typeof data);
        throw new Error('Invalid response format: Expected an array of jobs');
      }
      
      return data;
    } catch (error) {
      console.error('Error in getJobs:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  },

  async submitUserData(data: FormData): Promise<{ success: boolean; message: string }> {
    console.log('Submitting user data to:', `${API_BASE_URL}/submit-user-data`);
    try {
      const response = await fetch(`${API_BASE_URL}/submit-user-data`, {
        method: 'POST',
        body: data, // Send as FormData to handle file upload
      });

      console.log('Submit user data response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Submit user data error response:', errorText);
        throw new Error(`Failed to submit data: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Submit user data success:', result);
      return result;
    } catch (error) {
      console.error('Error in submitUserData:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  },

  async getResultById(resultId: string): Promise<TestResult> {
    const response = await fetch(`${API_BASE_URL}/get_result_by_id?result_id=${resultId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorMessage = 'Failed to fetch result';
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = responseText || errorMessage;
      }
      console.error('API Error Response:', responseText);
      throw new Error(errorMessage);
    }

    try {
      return JSON.parse(responseText);
    } catch (error) {
      console.error('Failed to parse response:', responseText);
      throw new Error('Invalid response format from server');
    }
  },
};