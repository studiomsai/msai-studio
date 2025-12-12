'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recentWork, setRecentWork] = useState([]);
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.push('/login');
          return;
        }
        setUser(user);

        // Fetch user profile data from users table
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          // If no profile exists, create one with default values
          const defaultProfile = {
            id: user.id,
            full_name: user.user_metadata?.display_name || '',
            email: user.email || '',
            phone: user.user_metadata?.phone || '',
            password: '', // Will be handled separately
            profile_image: null,
            available_credit: 20,
            total_credit: 20
          };
          const { data: newProfile, error: insertError } = await supabase
            .from('users')
            .insert(defaultProfile)
            .select()
            .single();

          if (insertError) {
            // Handle profile creation error gracefully
            console.warn('Could not create user profile, using default data');
            setUserData(defaultProfile);
          } else {
            setUserData(newProfile);
          }
        } else {
          setUserData(profileData);
        }

        // Fetch recent work
        const { data: workData, error: workError } = await supabase
          .from('work')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!workError) {
          setRecentWork(workData || []);
        }

      } catch (error) {
        // Handle loading errors gracefully
        console.warn('Error loading profile data:', error.message);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, [router]);

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadProfileImage = async (file) => {
    const fileName = `profile_${user.id}_${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage
      .from('profile-images')
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      let profileImageUrl = userData?.profile_image;

      if (profileImageFile) {
        profileImageUrl = await uploadProfileImage(profileImageFile);
      }

      const updates = {
        full_name: editForm.full_name,
        email: editForm.email,
        phone: editForm.phone,
        profile_image: profileImageUrl
      };

      // Update password if provided
      if (editForm.password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: editForm.password
        });
        if (passwordError) throw passwordError;
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Refetch the updated profile data
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      setUserData(updatedProfile);
      setIsEditModalOpen(false);
      setProfileImageFile(null);
      setProfileImagePreview(null);

    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = () => {
    setEditForm({
      full_name: userData?.full_name || '',
      email: userData?.email || '',
      phone: userData?.phone || '',
      password: ''
    });
    setIsEditModalOpen(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information and view your activity.</p>
        </div>

        {/* Credit Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Credit</h3>
            <p className="text-3xl font-bold text-green-600">{userData.available_credit || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Credit</h3>
            <p className="text-3xl font-bold text-blue-600">{userData.total_credit || 0}</p>
          </div>
        </div>

        {/* Main Profile Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Left Column - Profile Image */}
            <div className="md:w-2/5 p-8 bg-gray-50 flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {userData.profile_image ? (
                    <Image
                      src={userData.profile_image}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-4xl">
                      👤
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={openEditModal}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Change Photo
              </button>
            </div>

            {/* Right Column - User Information */}
            <div className="md:w-3/5 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={openEditModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded">{userData.full_name || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded">{userData.email || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded">{userData.phone || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded">••••••••</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Work Section */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Work</h2>
          {recentWork.length > 0 ? (
            <div className="space-y-4">
              {recentWork.map((work) => (
                <div key={work.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">{work.title}</h3>
                    <p className="text-sm text-gray-600">{new Date(work.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    work.status === 'completed' ? 'bg-green-100 text-green-800' :
                    work.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {work.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No recent work found.</p>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Profile</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => handleEditFormChange('full_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleEditFormChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => handleEditFormChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => handleEditFormChange('password', e.target.value)}
                  placeholder="Leave blank to keep current password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {profileImagePreview && (
                  <div className="mt-2">
                    <Image
                      src={profileImagePreview}
                      alt="Preview"
                      width={100}
                      height={100}
                      className="w-24 h-24 object-cover rounded-full border"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
