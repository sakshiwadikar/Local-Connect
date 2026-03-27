import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Bell, Lock, Eye, LogOut, ArrowLeft, Check, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validators } from '../lib/validators';
import { updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function CustomerSettings() {
  const navigate = useNavigate();
  const { user, logout, getUserProfileSync, updateUserProfile } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('account');
  const [isSaving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  
  const profile = getUserProfileSync();

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: profile?.emailNotifications !== false,
    smsNotifications: profile?.smsNotifications === true,
    marketingEmails: profile?.marketingEmails === true,
    showProfile: profile?.showProfile !== false,
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePreferenceChange = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const validateAccountForm = () => {
    const newErrors = {};

    // Phone validation
    const phoneValidation = validators.phone(formData.phone);
    if (!phoneValidation.valid) {
      newErrors.phone = phoneValidation.error;
    }

    // Address is optional but if provided should not be empty
    if (formData.address && formData.address.trim() === '') {
      newErrors.address = 'Address cannot be empty if provided';
    }

    return newErrors;
  };

  const handleSaveAccount = async () => {
    try {
      const newErrors = validateAccountForm();
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error('Please fix the errors in your form');
        return;
      }

      setSaving(true);
      
      updateUserProfile({
        phone: formData.phone,
        address: formData.address,
      });

      setErrors({});
      toast.success('Account settings saved successfully!');
    } catch (err) {
      toast.error(`Error saving settings: ${err.message}`);
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
        marketingEmails: preferences.marketingEmails,
        showProfile: preferences.showProfile,
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
        onClick={() => navigate('/profile')}
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              {[
                { id: 'account', label: 'Account', icon: User },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'privacy', label: 'Privacy & Security', icon: Lock },
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
            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account Information</h2>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    disabled
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50"
                  />
                  <p className="text-xs text-slate-500 mt-1">Update your name in your Google account</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50"
                  />
                  <p className="text-xs text-slate-500 mt-1">You can't change your email address</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
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
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
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
                  onClick={handleSaveAccount}
                  disabled={isSaving}
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? 'Saving...' : <><Check size={18} /> Save Changes</>}
                </button>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notification Preferences</h2>

                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive updates via SMS' },
                    { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive promotional offers and news' },
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

            {/* Privacy & Security Tab */}
            {activeTab === 'privacy' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Privacy & Security</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Eye size={18} />
                        Profile Visibility
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Allow others to see your profile</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.showProfile}
                        onChange={() => handlePreferenceChange('showProfile')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

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
                    <p className="text-sm text-red-600 dark:text-red-400 mb-3">Permanently delete your account and all associated data</p>
                    <button 
                      onClick={() => setShowDeleteModal(true)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSavePreferences}
                  disabled={isSaving}
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? 'Saving...' : <><Check size={18} /> Save Changes</>}
                </button>
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
                  This action cannot be undone. All your data will be permanently deleted.
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
