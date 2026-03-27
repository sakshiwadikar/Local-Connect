// Validation helper functions

export const validators = {
  // Email validation
  email: (email) => {
    if (!email) return { valid: false, error: 'Email is required' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Please enter a valid email address' };
    }
    return { valid: true };
  },

  // Phone validation (allows various formats, 10+ digits)
  phone: (phone) => {
    if (!phone) return { valid: true }; // Phone is optional
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      return { valid: false, error: 'Phone number must contain at least 10 digits' };
    }
    return { valid: true };
  },

  // URL validation (optional field)
  url: (url) => {
    if (!url) return { valid: true }; // URL is optional
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return { valid: true };
    } catch {
      return { valid: false, error: 'Please enter a valid website URL' };
    }
  },

  // Required text field
  required: (value, fieldName = 'This field') => {
    if (!value || value.trim() === '') {
      return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true };
  },

  // Business hours validation
  businessHours: (day, hours) => {
    if (hours.closed) return { valid: true };
    
    if (!hours.open || !hours.close) {
      return { valid: false, error: `Please set opening and closing times for ${day}` };
    }

    const [openHour, openMin] = hours.open.split(':').map(Number);
    const [closeHour, closeMin] = hours.close.split(':').map(Number);
    
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    if (closeTime <= openTime) {
      return { valid: false, error: `Closing time must be after opening time for ${day}` };
    }

    return { valid: true };
  },

  // Validate all business hours at once
  allBusinessHours: (businessHours) => {
    const errors = {};
    for (const [day, hours] of Object.entries(businessHours)) {
      const result = validators.businessHours(day, hours);
      if (!result.valid) {
        errors[day] = result.error;
      }
    }
    return Object.keys(errors).length === 0 ? { valid: true } : { valid: false, errors };
  },
};

// Validation schemas for forms
export const validationSchemas = {
  customerAccount: {
    phone: (value) => validators.phone(value),
    address: (value) => validators.required(value, 'Address'),
  },

  providerBusiness: {
    businessName: (value) => validators.required(value, 'Business Name'),
    phone: (value) => validators.phone(value),
    email: (value) => validators.email(value),
    website: (value) => validators.url(value),
    city: (value) => validators.required(value, 'City'),
    state: (value) => validators.required(value, 'State'),
    address: (value) => validators.required(value, 'Address'),
  },
};
