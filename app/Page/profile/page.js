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
          router.push('/Page/login');
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
          const media = await fetchRecentWorkMedia(user.id);
      setRecentWork(media);

      setLoading(false);

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
 const fetchRecentWorkMedia = async (userId) => {
    const { data, error } = await supabase.storage
      .from('profile-images')
      .list(userId, { limit: 20, sortBy: { column: 'created_at', order: 'desc' } });

    if (error || !data) return [];

    return data.map(file => {
      const { data: url } = supabase.storage
        .from('profile-images')
        .getPublicUrl(`${userId}/${file.name}`);

      return {
        id: file.id || file.name,
        type: file.metadata?.mimetype,
        url: url.publicUrl,
        created_at: file.created_at
      };
    });
  };
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
    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${ext}`;
    await supabase.storage.from('profile-images').upload(filePath, file, { upsert: true });
    const { data } = supabase.storage.from('profile-images').getPublicUrl(filePath);
    return data.publicUrl;
  };


  const handleSaveProfile = async () => {
    setSaving(true);
    let imageUrl = userData.profile_image;

    if (profileImageFile) imageUrl = await uploadProfileImage(profileImageFile);

    await supabase.from('users').update({
      full_name: editForm.full_name,
      phone: editForm.phone,
      profile_image: imageUrl
    }).eq('id', user.id);

    const media = await fetchRecentWorkMedia(user.id);
    setRecentWork(media);

    setIsEditModalOpen(false);
    setSaving(false);
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
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile py-30">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8 text-center ">
          <h1 className="text-2xl md:text-4xl font-medium text-center mb-5 sub-title inline-block">User Profile</h1>
          <p className="text-xl mb-16">Manage your account information and view your activity.</p>
        </div>

        {/* Credit Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="credit-box">
            <h3 className="text-3xl font-semibold mb-2">Available Credits</h3>
            <p className="text-3xl font-bold text-green-600">{userData.available_credit || 0}</p>
          </div>
          <div className="credit-box">
            <h3 className="text-3xl font-semibold mb-2">Total Credits</h3>
            <p className="text-3xl font-bold text-[#00C0FF]">{userData.total_credit + userData.available_credit|| 0} </p>
          </div>
        </div>

        {/* Main Profile Section */}
        <div className="bg-[#121212] rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Left Column - Profile Image */}
            <div className="md:w-2/5 p-8 bg-black flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-80 h-80 rounded-full overflow-hidden border-4 border-white shadow-lg">
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
                className="px-6 py-2 bg-[#00c0ff] text-black rounded-lg hover:bg-[#0e6c8b] transition-colors"
              >
                Change Photo
              </button>
            </div>

            {/* Right Column - User Information */}
            <div className="md:w-3/5 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold">Personal Information</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={openEditModal}
                    className="px-4 py-2 bg-[#00c0ff] text-black rounded-lg hover:bg-[#0e6c8b] transition-colors"
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
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <p className="border border-gray-400 bg-transparent text-white p-3 rounded">{userData.full_name || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <p className="border border-gray-400 bg-transparent text-white p-3 rounded">{userData.email || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <p className="border border-gray-400 bg-transparent text-white p-3 rounded">{userData.phone || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <p className="border border-gray-400 bg-transparent text-white p-3 rounded">••••••••</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Work Section */}
        <div className="bg-[#121212] rounded-lg shadow p-10 text-center">
          <h2 className="text-2xl md:text-4xl font-medium text-center mb-10 sub-title inline-block mx-auto">Recent Work</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentWork.map((file) => (
              <div key={file.id} className="recent-work-box border border-gray-400 rounded overflow-hidden">
                {file.type?.includes('video') ? (
                  <video src={file.url} controls className="w-full h-32 object-cover" />
                ) : (
                  <Image alt="file" src={file.url} width={300} height={200} className="w-full h-32 object-cover" />
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Profile</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => handleEditFormChange('full_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleEditFormChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => handleEditFormChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">New Password (optional)</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => handleEditFormChange('password', e.target.value)}
                  placeholder="Leave blank to keep current password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Profile Image</label>
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
                className="flex-1 px-4 py-2 bg-[#00c0ff] text-black rounded-lg hover:bg-[#0e6c8b] transition-colors disabled:opacity-50"
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
