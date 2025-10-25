# 🔐 Secure Jira Token Management Guide

This project now supports multiple secure ways to handle your Jira credentials, keeping your sensitive information safe while providing convenient development workflows.

## 🎯 **Available Security Options**

### **1. Environment Variables (Recommended for Development) ✅**

**Setup:**
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your credentials
JIRA_HOST=https://yourcompany.atlassian.net
JIRA_EMAIL=your.email@company.com
JIRA_TOKEN=your_jira_api_token_here
```

**Benefits:**
- ✅ **Never committed to git** (protected by .gitignore)
- ✅ **Server-side secure storage** - tokens never sent to frontend
- ✅ **Zero client-side exposure** - tokens remain on server only
- ✅ **Convenient development** - no need to enter credentials repeatedly
- ✅ **Override capability** - can still enter different credentials if needed

### **2. Deployment Environment Variables (Production)**

**Setup for Production:**
```bash
# Set environment variables on your server
export JIRA_HOST=https://yourcompany.atlassian.net
export JIRA_EMAIL=your.email@company.com
export JIRA_TOKEN=your_secure_production_token

# Or use your deployment platform's environment variable settings
# (Heroku, Vercel, AWS, etc.)
```

**Benefits:**
- ✅ **Production-grade security** - no files with sensitive data
- ✅ **Platform-native security** - uses hosting platform's secure variable storage
- ✅ **Easy rotation** - change tokens without code changes
- ✅ **Multi-environment support** - different tokens for dev/staging/prod

### **3. Manual Entry (Fallback)**

**When to use:**
- Testing with different accounts
- One-time usage scenarios
- When environment variables aren't available

**Security features:**
- ✅ **Local storage optional** - choose to remember or not
- ✅ **Token masking** - passwords are hidden in UI
- ✅ **No server storage** - manually entered tokens are not saved server-side

## 🔧 **How It Works**

### **Configuration Detection**
The app automatically detects your security setup:

```typescript
// Server checks environment variables
const config = {
  hasJiraHost: !!process.env.JIRA_HOST,
  hasJiraEmail: !!process.env.JIRA_EMAIL,
  hasJiraToken: !!process.env.JIRA_TOKEN,
  configurationStatus: {
    fullyConfigured: // All three are set
  }
}
```

### **Smart Authentication Flow**

1. **Fully Configured Server**: Skip authentication step or allow override
2. **Partially Configured**: Show what's missing, pre-fill available fields
3. **No Configuration**: Standard manual entry workflow

### **Secure API Communication**

```typescript
// Frontend sends only non-empty values
const payload = {
  boardId: formData.boardId,
  sprintId: formData.sprintId
  // Only include auth if provided (server uses env vars as fallback)
};

// Server uses environment variables as secure defaults
function getJiraCredentials(reqBody) {
  return {
    jiraHost: reqBody.jiraHost || process.env.JIRA_HOST,
    email: reqBody.email || process.env.JIRA_EMAIL,
    jiraToken: reqBody.jiraToken || process.env.JIRA_TOKEN
  };
}
```

## 🛡️ **Security Best Practices**

### **Environment Variables**
- ✅ **Never commit .env files** - already in .gitignore
- ✅ **Use strong API tokens** - generate from Jira settings
- ✅ **Rotate tokens regularly** - update .env when needed
- ✅ **Restrict token permissions** - only give necessary Jira permissions

### **Production Deployment**
- ✅ **Use platform environment variables** - not .env files
- ✅ **Enable HTTPS only** - secure transport
- ✅ **Monitor access logs** - track API usage
- ✅ **Regular security audits** - review token usage

### **Development Team**
- ✅ **Individual tokens** - each developer uses their own
- ✅ **Document setup** - share this guide with team
- ✅ **No shared credentials** - avoid team-wide tokens
- ✅ **Regular token cleanup** - remove unused tokens

## 📋 **Setup Instructions**

### **For Developers**

1. **Get Your Jira API Token:**
   ```
   https://id.atlassian.com/manage-profile/security/api-tokens
   ```

2. **Setup Environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Start Development:**
   ```bash
   npm run dev    # Development with hot reload
   npm start      # Production build + server
   ```

### **For Production Deployment**

1. **Set Environment Variables** (example for various platforms):
   
   **Heroku:**
   ```bash
   heroku config:set JIRA_HOST=https://company.atlassian.net
   heroku config:set JIRA_EMAIL=api@company.com
   heroku config:set JIRA_TOKEN=your_token
   ```
   
   **Vercel:**
   ```bash
   vercel env add JIRA_HOST production
   vercel env add JIRA_EMAIL production
   vercel env add JIRA_TOKEN production
   ```
   
   **Docker:**
   ```dockerfile
   ENV JIRA_HOST=https://company.atlassian.net
   ENV JIRA_EMAIL=api@company.com
   ENV JIRA_TOKEN=your_token
   ```

2. **Deploy Application**

## 🔍 **Configuration Status**

The application shows you exactly what's configured:

- 🟢 **Fully Configured**: All credentials set via environment variables
- 🟡 **Partially Configured**: Some credentials missing, manual entry required
- 🔴 **Not Configured**: All credentials must be entered manually

## 🚨 **Security Warnings**

### **❌ What NOT to do:**
- Don't commit .env files to version control
- Don't hardcode tokens in source code
- Don't share tokens in chat/email
- Don't use the same token across multiple projects/environments

### **✅ What TO do:**
- Use environment variables for server deployment
- Rotate tokens regularly
- Use individual developer tokens
- Monitor and audit token usage
- Set up proper HTTPS in production

## 🎉 **Benefits of This Approach**

1. **🔒 Maximum Security**: Tokens never exposed to frontend
2. **⚡ Great Developer Experience**: Setup once, use everywhere
3. **🔄 Flexible Authentication**: Support for multiple auth methods
4. **🛠️ Easy Configuration**: Environment variables are industry standard
5. **📊 Production Ready**: Scalable for team and enterprise use

This secure token management system ensures your Jira credentials are protected while maintaining an excellent developer experience! 🚀
