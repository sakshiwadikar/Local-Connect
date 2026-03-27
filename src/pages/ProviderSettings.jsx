import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Bell, Lock, MapPin, Clock, FileText, LogOut, ArrowLeft, Check, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validators } from '../lib/validators';
import { updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function ProviderSettings() {
  const navigate = useNavigate();
  const { user, logout, getUserProfileSync, updateUserProfile } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('business');
  const [isSaving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  
  const profile = getUserProfileSync();

  const [businessData, setBusinessData] = useState({
    businessName: profile?.businessName || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
    website: profile?.website || '',
    city: profile?.city || '',
    state: profile?.state || '',
    address: profile?.address || '',
  });

  const [businessHours, setBusinessHours] = useState(profile?.businessHours || {
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '10:00', close: '16:00', closed: false },
    sunday: { open: '00:00', close: '00:00', closed: true },
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: profile?.emailNotifications !== false,
    smsNotifications: profile?.smsNotifications === true,
    bookingNotifications: profile?.bookingNotifications !== false,
  });

  const [documents, setDocuments] = useState(profile?.documents || [
    { id: 1, name: 'Business License', status: 'verified' },
  ]);

  // Change Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  // Delete Account Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  const handleBusinessInputChange = (e) => {
    const { name, value } = e.target;
    setBusinessData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBusinessHoursChange = (day, field, value) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
    // Clear error for this day when user makes changes
    if (errors[day]) {
      setErrors(prev => ({ ...prev, [day]: '' }));
    }
  };

  const handlePreferenceChange = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const validateBusinessForm = () => {
    const newErrors = {};

    // Business name validation
    const nameValidation = validators.required(businessData.businessName, 'Business Name');
    if (!nameValidation.valid) {
      newErrors.businessName = nameValidation.error;
    }

    // Phone validation
    const phoneValidation = validators.phone(businessData.phone);
    if (!phoneValidation.valid) {
      newErrors.phone = phoneValidation.error;
    }

    // Email validation
    const emailValidation = validators.email(businessData.email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.error;
    }

    // Website validation (optional)
    const websiteValidation = validators.url(businessData.website);
    if (!websiteValidation.valid) {
      newErrors.website = websiteValidation.error;
    }

    // City validation
    const cityValidation = validators.required(businessData.city, 'City');
    if (!cityValidation.valid) {
      newErrors.city = cityValidation.error;
    }

    // State validation
    const stateValidation = validators.required(businessData.state, 'State');
    if (!stateValidation.valid) {
      newErrors.state = stateValidation.error;
    }

    // Address validation
    const addressValidation = validators.required(businessData.address, 'Address');
    if (!addressValidation.valid) {
      newErrors.address = addressValidation.error;
    }

    // Business hours validation
    const hoursValidation = validators.allBusinessHours(businessHours);
    if (!hoursValidation.valid) {
      Object.assign(newErrors, hoursValidation.errors);
    }

    return newErrors;
  };

  const handleSaveBusiness = async () => {
    try {
      const newErrors = validateBusinessForm();
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error('Please fix the errors in your form');
        return;
      }

      setSaving(true);
      
      updateUserProfile({
        businessName: businessData.businessName,
        phone: businessData.phone,
        email: businessData.email,
        website: businessData.website,
        city: businessData.city,
        state: businessData.state,
        address: businessData.address,
        businessHours: businessHours,
      });

      setErrors({});
      toast.success('Business information saved successfully!');
    } catch (err) {
      toast.error(`Error saving business info: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      
      updateUserProfile({
        emailNotifications: preferences.emailNotifications,
        smsNotifications: preferences.smsNotifications,
        bookingNotifications: preferences.bookingNotifications,
      });

      toast.success('Preferences saved successfully!');
    } catch (err) {
      toast.error(`Error saving preferences: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Password change handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }

    return errors;
  };

  const handleChangePassword = async () => {
    try {
      const errors = validatePasswordForm();

      if (Object.keys(errors).length > 0) {
        setPasswordErrors(errors);
        toast.error('Please fix the errors in the form');
        return;
      }

      setSaving(true);

      // Reauthenticate the user with their current password
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordData.currentPassword
      );

      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, passwordData.newPassword);

      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      if (err.code === 'auth/wrong-password') {
        setPasswordErrors({ currentPassword: 'Current password is incorrect' });
        toast.error('Current password is incorrect');
      } else if (err.code === 'auth/weak-password') {
        toast.error('New password is too weak. Use at least 6 characters');
      } else {
        toast.error(`Error changing password: ${err.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  // Delete account handlers
  const handleDeleteAccount = async () => {
    try {
      if (deleteConfirmation !== 'DELETE') {
        toast.error('Please type "DELETE" to confirm account deletion');
        return;
      }

      if (!deletePassword) {
        toast.error('Please enter your password to confirm');
        return;
      }

      setSaving(true);

      // Reauthenticate the user
      const credential = EmailAuthProvider.credential(user.email, deletePassword);
      await reauthenticateWithCredential(user, credential);

      // Delete user account from Firebase Auth
      await deleteUser(user);

      toast.success('Account deleted successfully');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      if (err.code === 'auth/wrong-password') {
        toast.error('Incorrect password');
      } else {
        toast.error(`Error deleting account: ${err.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const dayLabels = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Settings</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Please sign in to access your settings</p>
          <a href="/signin" className="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <button
        onClick={() => navigate('/provider-profile')}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 mb-6 font-semibold"
      >
        <ArrowLeft size={20} />
        Back to Profile
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Provider Settings</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your business information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              {[
                { id: 'business', label: 'Business Info', icon: MapPin },
                { id: 'hours', label: 'Business Hours', icon: Clock },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'documents', label: 'Documents', icon: FileText },
                { id: 'security', label: 'Security', icon: Lock },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-slate-200 dark:border-slate-800 last:border-b-0 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-slate-200 dark:border-slate-800"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Business Info Tab */}
            {activeTab === 'business' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Business Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Business Name</label>
                    <input
                      type="text"
                      name="businessName"
                      value={businessData.businessName}
                      onChange={handleBusinessInputChange}
                      placeholder="Enter your business name"
                      className={`w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border rounded-lg placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors ${
                        errors.businessName
                          ? 'border-red-500 dark:border-red-400 focus:border-red-500'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                    {errors.businessName && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.businessName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={businessData.phone}
                      onChange={handleBusinessInputChange}
                      placeholder="Enter phone number"
                      className={`w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border rounded-lg placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors ${
                        errors.phone
                          ? 'border-red-500 dark:border-red-400 focus:border-red-500'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={businessData.email}
                      onChange={handleBusinessInputChange}
                      placeholder="Enter business email"
                      className={`w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border rounded-lg placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors ${
                        errors.email
                          ? 'border-red-500 dark:border-red-400 focus:border-red-500'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={businessData.website}
                      onChange={handleBusinessInputChange}
                      placeholder="Enter website URL"
                      className={`w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border rounded-lg placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors ${
                        errors.website
                          ? 'border-red-500 dark:border-red-400 focus:border-red-500'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                    {errors.website && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.website}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      value={businessData.state}
                      onChange={handleBusinessInputChange}
                      placeholder="Enter state"
                      className={`w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border rounded-lg placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors ${
                        errors.state
                          ? 'border-red-500 dark:border-red-400 focus:border-red-500'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                    {errors.state && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.state}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={businessData.city}
                      onChange={handleBusinessInputChange}
                      placeholder="Enter city"
                      className={`w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border rounded-lg placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors ${
                        errors.city
                          ? 'border-red-500 dark:border-red-400 focus:border-red-500'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                    {errors.city && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.city}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Full Address</label>
                  <textarea
                    name="address"
                    value={businessData.address}
                    onChange={handleBusinessInputChange}
                    placeholder="Enter your full business address"
                    rows="3"
                    className={`w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border rounded-lg placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors ${
                      errors.address
                        ? 'border-red-500 dark:border-red-400 focus:border-red-500'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.address}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleSaveBusiness}
                  disabled={isSaving}
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? 'Saving...' : <><Check size={18} /> Save Business Info</>}
                </button>
              </div>
            )}

            {/* Business Hours Tab */}
            {activeTab === 'hours' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Business Hours</h2>

                <div className="space-y-3">
                  {Object.entries(dayLabels).map(([dayKey, dayLabel]) => (
                    <div 
                      key={dayKey} 
                      className={`p-4 border rounded-lg transition-colors ${
                        errors[dayKey]
                          ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/10'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-24">
                          <p className="font-semibold text-slate-900 dark:text-white">{dayLabel}</p>
                        </div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={businessHours[dayKey].closed}
                            onChange={(e) => handleBusinessHoursChange(dayKey, 'closed', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-slate-600 dark:text-slate-400">Closed</span>
                        </label>
                        {!businessHours[dayKey].closed && (
                          <div className="flex-1 flex items-center gap-4">
                            <div>
                              <input
                                type="time"
                                value={businessHours[dayKey].open}
                                onChange={(e) => handleBusinessHoursChange(dayKey, 'open', e.target.value)}
                                className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded"
                              />
                            </div>
                            <span className="text-slate-600 dark:text-slate-400">to</span>
                            <div>
                              <input
                                type="time"
                                value={businessHours[dayKey].close}
                                onChange={(e) => handleBusinessHoursChange(dayKey, 'close', e.target.value)}
                                className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      {errors[dayKey] && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors[dayKey]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSaveBusiness}
                  disabled={isSaving}
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? 'Saving...' : <><Check size={18} /> Save Hours</>}
                </button>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notification Preferences</h2>

                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive new bookings and messages via email' },
                    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive urgent updates via SMS' },
                    { key: 'bookingNotifications', label: 'Booking Alerts', desc: 'Get instant notifications for new bookings' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{item.label}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences[item.key]}
                          onChange={() => handlePreferenceChange(item.key)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSavePreferences}
                  disabled={isSaving}
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? 'Saving...' : <><Check size={18} /> Save Preferences</>}
                </button>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verification Documents</h2>

                <div className="space-y-4">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{doc.name}</p>
                        <p className={`text-sm mt-1 ${
                          doc.status === 'verified'
                            ? 'text-green-600 dark:text-green-400'
                            : doc.status === 'pending'
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {doc.status === 'verified' ? '✓ Verified' : doc.status === 'pending' ? '⏳ Pending' : '✗ Rejected'}
                        </p>
                      </div>
                      <button className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <button className="w-full px-4 py-2 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-center gap-2">
                  <Plus size={18} />
                  Upload New Document
                </button>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Note:</strong> Upload government-approved ID, business license, and relevant certifications for verification.
                  </p>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Security Settings</h2>

                <div className="space-y-4">
                  <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                      <Lock size={18} />
                      Change Password
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Update your password regularly to keep your account secure</p>
                    <button 
                      onClick={() => setShowPasswordModal(true)}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors">
                      Change Password
                    </button>
                  </div>

                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="font-semibold text-red-700 dark:text-red-300 mb-2">Delete Account</p>
                    <p className="text-sm text-red-600 dark:text-red-400 mb-3">Permanently delete your account and all associated business data</p>
                    <button 
                      onClick={() => setShowDeleteModal(true)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 rounded-xl max-w-sm w-full shadow-xl border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Change Password</h3>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your current password"
                    className={`w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border rounded-lg placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors ${
                      passwordErrors.currentPassword
                        ? 'border-red-500 dark:border-red-400'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {passwordErrors.currentPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your new password"
                    className={`w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border rounded-lg placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors ${
                      passwordErrors.newPassword
                        ? 'border-red-500 dark:border-red-400'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {passwordErrors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm your new password"
                    className={`w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border rounded-lg placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors ${
                      passwordErrors.confirmPassword
                        ? 'border-red-500 dark:border-red-400'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {passwordErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setPasswordErrors({});
                    }}
                    className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition-colors"
                  >
                    {isSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 rounded-xl max-w-sm w-full shadow-xl border border-red-200 dark:border-red-800"
            >
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-red-700 dark:text-red-300">Delete Account</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  This action cannot be undone. All your business data will be permanently deleted.
                </p>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Type "DELETE" to confirm</label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Type DELETE"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg placeholder-slate-400 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Enter your password to confirm</label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg placeholder-slate-400 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmation('');
                      setDeletePassword('');
                    }}
                    className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isSaving || deleteConfirmation !== 'DELETE' || !deletePassword}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition-colors"
                  >
                    {isSaving ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
