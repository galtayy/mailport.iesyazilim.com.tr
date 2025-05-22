function extractCompanyName(email, senderName) {
  if (!email) return '';

  const domain = email.split('@')[1];
  if (!domain) return '';

  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
  
  if (commonDomains.includes(domain.toLowerCase())) {
    return senderName || '';
  }

  const parts = domain.split('.');
  if (parts.length >= 2) {
    let companyName = parts[parts.length - 2];
    
    companyName = companyName.charAt(0).toUpperCase() + companyName.slice(1);
    
    const commonSuffixes = ['ltd', 'inc', 'corp', 'co', 'com', 'org'];
    if (commonSuffixes.includes(companyName.toLowerCase())) {
      if (parts.length >= 3) {
        companyName = parts[parts.length - 3];
        companyName = companyName.charAt(0).toUpperCase() + companyName.slice(1);
      }
    }
    
    return companyName;
  }

  return '';
}

function extractSenderName(name) {
  if (!name) return '';

  name = name.trim();
  
  name = name.replace(/[<>"\[\]]/g, '');
  
  if (name.includes('@')) {
    const emailMatch = name.match(/^(.+?)\s*<.*@.*>$/);
    if (emailMatch) {
      name = emailMatch[1].trim();
    } else {
      const parts = name.split('@')[0];
      name = parts.replace(/[._-]/g, ' ');
    }
  }

  name = name.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return name;
}

function sanitizeEmailContent(content) {
  if (!content) return '';
  
  content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  content = content.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  content = content.replace(/javascript:/gi, '');
  content = content.replace(/on\w+\s*=/gi, '');
  
  return content;
}

module.exports = {
  extractCompanyName,
  extractSenderName,
  sanitizeEmailContent
};