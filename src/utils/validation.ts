// Form validation utilities
export interface FormData {
  jiraHost: string;
  email: string;
  jiraToken: string;
  projectKey: string;
  boardId: string;
  sprintId: string;
  rememberMe: boolean;
}

export class FormValidator {
  static validateUrl(url: string): boolean {
    try {
      if (!url || typeof url !== 'string') return false;
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateRequired(value: string): boolean {
    return Boolean(value && typeof value === 'string' && value.trim().length > 0);
  }

  static validateNumeric(value: string): boolean {
    return Boolean(value && typeof value === 'string' && !isNaN(Number(value)) && parseInt(value) > 0);
  }

  static validateForm(formData: FormData): string[] {
    const errors: string[] = [];

    if (!this.validateRequired(formData.jiraHost)) {
      errors.push('Jira Host is required');
    } else if (!this.validateUrl(formData.jiraHost)) {
      errors.push('Jira Host must be a valid URL');
    }

    if (!this.validateRequired(formData.email)) {
      errors.push('Email is required');
    } else if (!this.validateEmail(formData.email)) {
      errors.push('Email must be valid');
    }

    if (!this.validateRequired(formData.jiraToken)) {
      errors.push('Jira Token is required');
    }

    if (!this.validateRequired(formData.boardId)) {
      errors.push('Board ID is required');
    } else if (!this.validateNumeric(formData.boardId)) {
      errors.push('Board ID must be a valid number');
    }

    if (!this.validateRequired(formData.sprintId)) {
      errors.push('Sprint ID is required');
    } else if (!this.validateNumeric(formData.sprintId)) {
      errors.push('Sprint ID must be a valid number');
    }

    return errors;
  }
}
