import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Trophy, Flame, Zap, Edit2, Check, X, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar } from '../components/ui/avatar';

const ProfilePage = () => {
  const user = useAuthStore(state => state.user);
  const updateProfile = useAuthStore(state => state.updateProfile);
  const isInitializingAuth = useAuthStore(state => state.isInitializingAuth);

  const [joinDate, setJoinDate] = useState('');
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setJoinDate(user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A');
      setFollowingCount(user.following ? user.following.length : 0);
      setFollowersCount(user.followers ? user.followers.length : 0);
      setEditName(user.name || user.username || '');
      setEditEmail(user.email || '');
      setEditBio(user.bio || '');
      setEditAvatar(null);
    }
  }, [user]);

  if (isInitializingAuth) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-white flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-black">
        <h1 className="flex items-center text-3xl font-bold mb-4 space-x-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>Profile</span>
        </h1>
        <p className="text-gray-700">No user data available.</p>
      </div>
    );
  }

  const profileEmoji = '😀';

  const handleEditClick = () => {
    setIsEditing(true);
    setSuccess(null);
    setError(null);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditName(user.name || user.username || '');
    setEditEmail(user.email || '');
    setEditBio(user.bio || '');
    setEditAvatar(null);
    setError(null);
    setSuccess(null);
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEditAvatar(e.target.files[0]);
    }
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const profileData = {
        name: editName,
        email: editEmail,
        bio: editBio,
      };

      if (editAvatar) {
        const formData = new FormData();
        formData.append('avatar', editAvatar);
        formData.append('name', editName);
        formData.append('email', editEmail);
        formData.append('bio', editBio);

        await updateProfile(formData);
      } else {
        await updateProfile(profileData);
      }

      setSuccess('Profile updated successfully.');
      setIsEditing(false);
      setEditAvatar(null);
    } catch {
      setError('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
      <div className="max-w-5xl mx-auto p-6 bg-gray-900 text-white rounded-lg space-y-8">
      <div className="flex items-center space-x-8">
        <div className="relative">
          <div className="text-9xl rounded-lg bg-gray-700 flex items-center justify-center w-40 h-40 select-none overflow-hidden">
            {editAvatar ? (
              <Avatar
                src={URL.createObjectURL(editAvatar)}
                alt="Avatar Preview"
                className="w-full h-full"
              />
            ) : user.profile?.avatar ? (
              <Avatar
                src={user.profile.avatar}
                alt={`${user.name || user.username}'s avatar`}
                className="w-full h-full"
              />
            ) : (
              <span>{profileEmoji}</span>
            )}
          </div>
          {isEditing && (
            <button
              aria-label="Upload profile photo"
              className="absolute bottom-2 right-2 bg-gray-800 p-2 rounded-full hover:bg-gray-700"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="w-6 h-6 text-white" />
            </button>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div className="flex-1 space-y-2">
          {isEditing ? (
            <>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-4xl font-bold bg-gray-800 rounded px-3 py-1 w-full text-white focus:outline-none"
                disabled={isSaving}
                placeholder="Name"
              />
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="text-lg bg-gray-800 rounded px-3 py-1 w-full text-white focus:outline-none"
                disabled={isSaving}
                placeholder="Email"
              />
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="text-md bg-gray-800 rounded px-3 py-2 w-full text-white focus:outline-none resize-none"
                disabled={isSaving}
                placeholder="Bio"
                rows={3}
              />
            </>
          ) : (
            <>
              <h1 className="text-5xl font-bold">{user.name || user.username || 'User'}</h1>
              <p className="text-gray-400">{user.email}</p>
              <p className="text-gray-400 mt-1">{user.bio}</p>
            </>
          )}
          <p className="text-gray-400 mt-1">Joined {joinDate}</p>
          <div className="flex space-x-6 mt-4 text-blue-400 font-semibold">
            <Link to="#" className="hover:underline">
              {followingCount} Following
            </Link>
            <Link to="#" className="hover:underline">
              {followersCount} Followers
            </Link>
          </div>
          <div className="mt-4">
            {isEditing ? (
              <div className="flex space-x-4">
                <button
                  onClick={handleSaveClick}
                  disabled={isSaving}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
                >
                  <Check className="w-5 h-5" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancelClick}
                  disabled={isSaving}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleEditClick}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mt-4"
              >
                <Edit2 className="w-5 h-5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {success && <p className="text-green-500 mt-2">{success}</p>}
        </div>
      </div>

      <section>
        <h2 className="text-3xl font-semibold mb-6 flex items-center space-x-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>Statistics</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="bg-gray-800">
            <CardHeader className="flex items-center space-x-3">
              <Flame className="w-6 h-6 text-red-500" />
              <CardTitle>Day Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{user.gamification?.streak?.current || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800">
            <CardHeader className="flex items-center space-x-3">
              <Zap className="w-6 h-6 text-yellow-400" />
              <CardTitle>Total XP</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{user.gamification?.totalXp || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800">
            <CardHeader className="flex items-center space-x-3">
              <Badge className="w-6 h-6 text-blue-400" />
              <CardTitle>Current League</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{user.gamification?.league || 'None'}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800">
            <CardHeader className="flex items-center space-x-3">
              <Trophy className="w-6 h-6 text-purple-500" />
              <CardTitle>Top 3 Finishes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{user.gamification?.topFinishes || 0}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-semibold">Achievements</h2>
          <Link to="#" className="text-blue-400 hover:underline font-semibold">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {user.gamification?.achievements?.slice(0, 3).map((achievement, idx) => (
            <Card key={idx} className="bg-gray-800 p-4 flex items-center space-x-4">
              <div className="text-5xl">{achievement.icon || '🏆'}</div>
              <div>
                <h3 className="font-semibold">{achievement.title || 'Achievement'}</h3>
                <p className="text-sm text-gray-400">{achievement.description || ''}</p>
              </div>
            </Card>
          )) || <p>No achievements yet.</p>}
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
