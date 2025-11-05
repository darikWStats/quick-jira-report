import { useState, useEffect } from 'react';
import { ApiService, AuthData, Project, AppConfig } from '../services/api';
import { StorageUtil } from '../utils/storage';
import { FormData as FormDataType } from '../utils/validation';

interface UseJiraAuthReturn {
  formData: FormDataType;
  appConfig: AppConfig | null;
  isLoggedIn: boolean;
  loadingLogin: boolean;
  loadingConfig: boolean;
  projects: Project[];
  error: string;
  handleInputChange: (field: keyof FormDataType) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogin: () => Promise<void>;
  handleLogout: () => void;
  canLogin: () => boolean;
  showError: (message: string) => void;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useJiraAuth(): UseJiraAuthReturn {
  const [formData, setFormData] = useState<FormDataType>({
    jiraHost: '',
    email: '',
    jiraToken: '',
    projectKey: '',
    boardId: '',
    sprintId: '',
    rememberMe: false
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [error, setError] = useState<string>('');
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Load configuration and saved data on mount
  useEffect(() => {
    const loadAppConfig = async () => {
      try {
        setLoadingConfig(true);
        const config = await ApiService.getConfig();
        setAppConfig(config);
        console.log('🔧 App Configuration Loaded:', config);
        console.log('📊 Environment Status:', {
          fullyConfigured: config.configurationStatus.fullyConfigured,
          hasJiraHost: config.hasJiraHost,
          hasJiraEmail: config.hasJiraEmail,
          hasJiraToken: config.hasJiraToken,
          missingCredentials: config.configurationStatus.missingCredentials
        });
        
        // If server has environment variables, auto-fill them
        if (config.hasJiraHost && config.jiraHost) {
          setFormData(prev => ({ ...prev, jiraHost: config.jiraHost || '' }));
          console.log('🔗 Auto-filled Jira Host from environment:', config.jiraHost);
        }
        if (config.hasJiraEmail && config.jiraEmail) {
          setFormData(prev => ({ ...prev, email: config.jiraEmail || '' }));
          console.log('📧 Auto-filled Jira Email from environment:', config.jiraEmail);
        }
        if (config.hasJiraToken) {
          console.log('🔐 Jira Token available from backend environment (not displayed for security)');
        }
        
        // Log what will be auto-filled vs needs manual entry
        const autoFilled: string[] = [];
        const needsManual: string[] = [];
        
        if (config.hasJiraHost) autoFilled.push('JIRA_HOST');
        else needsManual.push('JIRA_HOST');
        
        if (config.hasJiraEmail) autoFilled.push('JIRA_EMAIL');
        else needsManual.push('JIRA_EMAIL');
        
        if (config.hasJiraToken) autoFilled.push('JIRA_TOKEN');
        else needsManual.push('JIRA_TOKEN');
        
        console.log('✅ Auto-filled from environment:', autoFilled.length > 0 ? autoFilled.join(', ') : 'None');
        console.log('⚠️  Requires manual entry:', needsManual.length > 0 ? needsManual.join(', ') : 'None');
      } catch (error) {
        console.error('Failed to load app configuration:', error);
        showError('Failed to load app configuration');
      } finally {
        setLoadingConfig(false);
      }
    };

    const loadSavedData = () => {
      const savedJiraHost = StorageUtil.get('jiraHost');
      const savedEmail = StorageUtil.get('email');
      
      if (savedJiraHost) setFormData(prev => ({ ...prev, jiraHost: savedJiraHost }));
      if (savedEmail) setFormData(prev => ({ ...prev, email: savedEmail }));
      
      if (savedJiraHost || savedEmail) {
        setFormData(prev => ({ ...prev, rememberMe: true }));
      }
    };

    loadAppConfig();
    loadSavedData();
  }, []);

  const handleInputChange = (field: keyof FormDataType) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const canLogin = (): boolean => {
    const hasHost = formData.jiraHost || appConfig?.hasJiraHost;
    const hasEmail = formData.email || appConfig?.hasJiraEmail;
    const hasToken = formData.jiraToken || appConfig?.hasJiraToken;
    return Boolean(hasHost && hasEmail && hasToken);
  };

  const handleLogin = async () => {
    const hasHost = formData.jiraHost || appConfig?.hasJiraHost;
    const hasEmail = formData.email || appConfig?.hasJiraEmail;
    const hasToken = formData.jiraToken || appConfig?.hasJiraToken;
    
    if (!hasHost || !hasEmail || !hasToken) {
      showError('Please fill in all required authentication fields or ensure they are configured in backend environment');
      return;
    }

    setLoadingLogin(true);
    try {
      const authData: AuthData = {
        jiraHost: formData.jiraHost,
        email: formData.email,
        jiraToken: formData.jiraToken
      };

      // Test the connection by fetching projects
      const projectsData = await ApiService.getProjects(authData);
      setProjects(projectsData.projects || []);
      setIsLoggedIn(true);

      // Save auth data if "Remember me" is checked
      if (formData.rememberMe) {
        StorageUtil.save('jiraHost', formData.jiraHost);
        StorageUtil.save('email', formData.email);
      }
    } catch (error) {
      showError(`Authentication failed: ${(error as Error).message}`);
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setProjects([]);
    setFormData(prev => ({ ...prev, boardId: '', sprintId: '' }));
  };

  return {
    formData,
    appConfig,
    isLoggedIn,
    loadingLogin,
    loadingConfig,
    projects,
    error,
    handleInputChange,
    handleLogin,
    handleLogout,
    canLogin,
    showError,
    setFormData,
    setProjects,
    setIsLoggedIn
  };
}
