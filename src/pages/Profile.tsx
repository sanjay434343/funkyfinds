import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { realtimeDb } from '../lib/firebase';
import { ref, get, update, onValue } from 'firebase/database';
import { LoginModal } from '../components/LoginModal';
import { useStore } from '../store/useStore';

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinedDate?: string;
  lastActive?: string;
  username?: string;
  address?: {
    name: string;
    mobileNumber: string;
    backupMobileNumber: string;
    doorNumber: string;
    street: string;
    city: string;
    pincode: string;
    landmark: string;
  };
  locationStatus?: boolean;
  displayName?: string;
}

const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  }).format(date);
};

const HelloModal: React.FC<{ isOpen: boolean; onClose: () => void; setShowLocationModal: (show: boolean) => void }> = ({ isOpen, onClose, setShowLocationModal }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-8 shadow-xl relative max-w-md w-full mx-4">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">👋 Hello!</h2>
          <p className="text-gray-600 mb-6">
          🌟 Hey Share your location with us to make your experience even more amazing! 📍✨
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                onClose();
                setShowLocationModal(true);
              }}
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-600 transition-colors"
            >
             Add now
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ 
  isOpen, 
  onClose, 
  children 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl relative max-w-md w-full mx-4">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

const LogoutModal: React.FC<{ isOpen: boolean; onClose: () => void; handleLogout: () => void }> = ({ isOpen, onClose, handleLogout }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Logout Confirmation</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            X
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          If you logout, your cart data will be erased.
        </p>

        <div className="flex flex-col mt-4">
          <button onClick={handleLogout} className="bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors w-full m-1">
            OK, Logout
          </button>
          <button onClick={onClose} className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors w-full m-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Rename LoginModal to ProfileLoginModal
const ProfileLoginModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Login</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            X
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Please login to access your profile.
        </p>

        <div className="flex flex-col mt-4">
          <button onClick={() => window.location.href = '/login'} className="bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors w-full m-1">
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState<UserProfile | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showHelloModal, setShowHelloModal] = useState(false);
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [backupMobileNumber, setBackupMobileNumber] = useState('');
  const [doorNumber, setDoorNumber] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const uid = localStorage.getItem('uid');
  const currentUsername = 'sanjay434343'; // Current user's login
  const [displayName, setDisplayName] = useState('');
  const [isChanged, setIsChanged] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toggleLoginModal } = useStore();

  useEffect(() => {
    const storedUid = localStorage.getItem('uid');
    if (storedUid) {
      const userRef = ref(realtimeDb, `users/${storedUid}`);
      const unsubscribe = onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUser(data);
          setDisplayName(data.displayName || ''); // Ensure displayName is set correctly
        }
      });

      return () => unsubscribe(); // Cleanup listener on unmount
    }
  }, []);

  useEffect(() => {
    const storedUid = localStorage.getItem('uid');
    if (storedUid) {
      const userRef = ref(realtimeDb, `users/${storedUid}`);
      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUser({
              name: userData.displayName || currentUsername,
              email: userData.email,
              avatar: userData.avatar || '/default-avatar.png',
              bio: userData.bio || 'No bio added yet',
              location: userData.location || '',
              joinedDate: userData.joinedDate || '2024-12-21',
              lastActive: formatDateTime(new Date()),
              username: currentUsername,
              address: userData.address,
              locationStatus: userData.locationStatus
            });
            setEditForm({
              ...userData,
              name: userData.displayName || currentUsername,
              username: currentUsername,
              address: userData.address,
              locationStatus: userData.locationStatus
            });
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [currentUsername]);

  useEffect(() => {
    const uid = localStorage.getItem('uid');
    if (!uid) {
      toggleLoginModal(); // Show login modal
      navigate('/'); // Redirect to home page
    } else {
      const userRef = ref(realtimeDb, `users/${uid}`);
      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUser({
              name: userData.displayName || currentUsername,
              email: userData.email,
              avatar: userData.avatar || '/default-avatar.png',
              bio: userData.bio || 'No bio added yet',
              location: userData.location || '',
              joinedDate: userData.joinedDate || '2024-12-21',
              lastActive: formatDateTime(new Date()),
              username: currentUsername,
              address: userData.address,
              locationStatus: userData.locationStatus
            });
            setEditForm({
              ...userData,
              name: userData.displayName || currentUsername,
              username: currentUsername,
              address: userData.address,
              locationStatus: userData.locationStatus
            });
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [currentUsername, navigate, toggleLoginModal]);

  useEffect(() => {
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleEdit = () => setIsEditing(true);
  
  const handleAddLocationClick = () => setShowHelloModal(true);

  const handleHelloModalClose = () => {
    setShowHelloModal(false);
    setShowLocationModal(true);
  };

  const handleSave = async () => {
    if (!uid || !editForm) return;

    try {
      const userRef = ref(realtimeDb, `users/${uid}`);
      await update(userRef, {
        displayName: editForm.name || '',
        bio: editForm.bio || '', 
        address: editForm.address || user?.address || {},
        locationStatus: user?.locationStatus || false,
        lastActive: formatDateTime(new Date())
      });

      setUser(prev => prev ? { ...prev, displayName: editForm.name || '', bio: editForm.bio || '' } : null);
      setShowLocationModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setEditForm(user);
    setIsEditing(false);
  };

  const handleLocationSave = async () => {
    if (!uid) return;

    try {
      const userRef = ref(realtimeDb, `users/${uid}`);
      await update(userRef, {
        address: {
          name: name || '',
          mobileNumber: mobileNumber || '',
          backupMobileNumber: backupMobileNumber || '',
          doorNumber: doorNumber || '',
          street: street || '',
          city: city || '',
          pincode: pincode || '',
          landmark: landmark || '',
        },
        locationStatus: true,
        lastActive: formatDateTime(new Date()),
        displayName: editForm?.name || '',
        email: editForm?.email || ''
      });
      setUser(prev => prev ? { ...prev, address: {
        name: name || '',
        mobileNumber: mobileNumber || '',
        backupMobileNumber: backupMobileNumber || '',
        doorNumber: doorNumber || '',
        street: street || '',
        city: city || '',
        pincode: pincode || '',
        landmark: landmark || '',
      }, locationStatus: true } : null);
      setShowLocationModal(false);
      setIsChanged(false); // Reset change tracker after save
      window.location.reload(); // Refresh the page after saving
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setIsChanged(true); // Mark as changed
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#761600FF', '#00540FFF', '#00177EFF', '#6F7700FF', '#8B004AFF', '#00645FFF'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem('uid');
    localStorage.removeItem('cartItems');
    console.log('User logged out and cart data erased.');

    setIsLogoutModalOpen(false);
    navigate('/'); // Navigate to home page after logout
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <ProfileLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-black to-gray-600"></div>

          {/* Profile Content */}
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="absolute -top-16 left-6">
              <div
                style={{
                  backgroundColor: getAvatarColor(user?.name || 'User'),
                  width: '128px',
                  height: '128px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#FFFFFF'
                }}
              >
                {getInitials(user?.name || 'User')}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-4">
              {isEditing ? (
                <div className="space-x-3">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-black  text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="space-x-3">
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Profile Information */}
            <div className="mt-8">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={editForm?.name}
                      onChange={(e) => setEditForm({ ...editForm!, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={editForm?.email}
                      disabled
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm p-2"
                    />
                  </div>
                  {user?.locationStatus && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editForm?.address?.name}
                          onChange={(e) => setEditForm({ ...editForm!, address: { ...editForm!.address, name: e.target.value } })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                          placeholder="Name"
                        />
                        <input
                          type="text"
                          value={editForm?.address?.mobileNumber}
                          onChange={(e) => setEditForm({ ...editForm!, address: { ...editForm!.address, mobileNumber: e.target.value } })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                          placeholder="Mobile Number"
                        />
                        <input
                          type="text"
                          value={editForm?.address?.backupMobileNumber}
                          onChange={(e) => setEditForm({ ...editForm!, address: { ...editForm!.address, backupMobileNumber: e.target.value } })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                          placeholder="Backup Mobile Number"
                        />
                        <input
                          type="text"
                          value={editForm?.address?.doorNumber}
                          onChange={(e) => setEditForm({ ...editForm!, address: { ...editForm!.address, doorNumber: e.target.value } })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                          placeholder="Door Number"
                        />
                        <input
                          type="text"
                          value={editForm!.address?.street}
                          onChange={(e) => setEditForm({ ...editForm!, address: { ...editForm!.address, street: e.target.value } })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                          placeholder="Street"
                        />
                        <input
                          type="text"
                          value={editForm?.address?.city}
                          onChange={(e) => setEditForm({ ...editForm!, address: { ...editForm!.address, city: e.target.value } })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                          placeholder="City"
                        />
                        <input
                          type="text"
                          value={editForm?.address?.pincode}
                          onChange={(e) => setEditForm({ ...editForm!, address: { ...editForm!.address, pincode: e.target.value } })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                          placeholder="Pincode"
                        />
                        <input
                          type="text"
                          value={editForm?.address?.landmark}
                          onChange={(e) => setEditForm({ ...editForm!, address: { ...editForm!.address, landmark: e.target.value } })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                          placeholder="Landmark"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{user?.name
                    }</h1>
                    <p className="text-gray-500">{user?.email}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="text-sm text-gray-500">Location Status</div>
                      {user?.locationStatus ? (
                        <div className="text-gray-900">Added</div>
                      ) : (
                        <button
                          onClick={handleAddLocationClick}
                          className="py-1 text-red-500 rounded-md"
                        >
                          Add Now
                        </button>
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Joined</div>
                      <div className="text-gray-900">{user?.joinedDate}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hello Modal */}
      <HelloModal 
        isOpen={showHelloModal} 
        onClose={() => setShowHelloModal(false)}
        setShowLocationModal={setShowLocationModal}
      />

      {/* Location Modal */}
      <Modal isOpen={showLocationModal} onClose={() => setShowLocationModal(false)}>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="p-6 bg-white rounded-lg shadow-md w-full h-full max-w-2xl">
            <h2 className="text-2xl font-semibold text-black mb-4">Happily request to add the location</h2>
            <p className="text-gray-600 mb-6">Welcome to the location update feature. Would you like to set your location?</p>
            <input
              type="text"
              value={name}
              onChange={handleInputChange(setName)}
              className="mt-2 block w-full rounded-md border border-black shadow-sm focus:border-black focus:ring focus:ring-black p-3"
              placeholder="Enter your name"
            />
            <input
              type="text"
              value={mobileNumber}
              onChange={handleInputChange(setMobileNumber)}
              className="mt-2 block w-full rounded-md border border-black shadow-sm focus:border-black focus:ring focus:ring-black p-3"
              placeholder="Enter your mobile number"
            />
            <input
              type="text"
              value={backupMobileNumber}
              onChange={handleInputChange(setBackupMobileNumber)}
              className="mt-2 block w-full rounded-md border border-black shadow-sm focus:border-black focus:ring focus:ring-black p-3"
              placeholder="Enter your backup mobile number"
            />
            <input
              type="text"
              value={doorNumber}
              onChange={handleInputChange(setDoorNumber)}
              className="mt-2 block w-full rounded-md border border-black shadow-sm focus:border-black focus:ring focus:ring-black p-3"
              placeholder="Enter your door number"
            />
            <input
              type="text"
              value={street}
              onChange={handleInputChange(setStreet)}
              className="mt-2 block w-full rounded-md border border-black shadow-sm focus:border-black focus:ring focus:ring-black p-3"
              placeholder="Enter your street"
            />
            <input
              type="text"
              value={city}
              onChange={handleInputChange(setCity)}
              className="mt-2 block w-full rounded-md border border-black shadow-sm focus:border-black focus:ring focus:ring-black p-3"
              placeholder="Enter your city"
            />
            <input
              type="text"
              value={pincode}
              onChange={handleInputChange(setPincode)}
              className="mt-2 block w-full rounded-md border border-black shadow-sm focus:border-black focus:ring focus:ring-black p-3"
              placeholder="Enter your pincode"
            />
            <input
              type="text"
              value={landmark}
              onChange={handleInputChange(setLandmark)}
              className="mt-2 block w-full rounded-md border border-black shadow-sm focus:border-black focus:ring focus:ring-black p-3"
              placeholder="Enter a landmark"
            />
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowLocationModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLocationSave}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-700 transition-colors"
                disabled={!isChanged}
              >
                Save Location
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Logout Modal */}
      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} handleLogout={handleLogout} />
    </div>
  );
};

export default Profile;