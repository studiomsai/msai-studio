'use client';

import { useState, useEffect } from 'react';

export default function SuperAdminPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPayments, setUserPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (username === 'superadmin' && password === 'superadmin@123') {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/get-all-users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data.users);
        setIsLoggedIn(true);
      } catch (err) {
        setError('Failed to fetch users: ' + err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setUsers([]);
    setError('');
  };

  const handleViewPayments = async (user) => {
    setSelectedUser(user);
    setPaymentsLoading(true);
    setPaymentsError('');
    try {
      const response = await fetch(`/api/get-user-payments/${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      const data = await response.json();
      setUserPayments(data.payments);
    } catch (err) {
      setPaymentsError('Failed to fetch payments: ' + err.message);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const closePaymentsModal = () => {
    setSelectedUser(null);
    setUserPayments([]);
    setPaymentsError('');
  };

  if (!mounted) {
    return (
      <div className="user-profile py-30">
        <div className="container mx-auto">
          <div className="max-w-md w-full mx-auto">
            <div className="bg-[#121212] rounded-lg shadow-lg overflow-hidden">
              <div className="p-8">
                <h1 className="text-2xl md:text-4xl font-medium text-center mb-5 sub-title inline-block">Super Admin Login</h1>
                <p>Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="user-profile py-30">
        <div className="container mx-auto">
          <div className="max-w-md w-full mx-auto">
            <div className="bg-[#121212] rounded-lg shadow-lg overflow-hidden">
              <div className="p-8">
                <h1 className="text-2xl md:text-4xl font-medium text-center mb-5 sub-title inline-block">Super Admin Login</h1>
                <form className="space-y-6" onSubmit={handleLogin}>
                  <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-400 bg-transparent text-white rounded focus:ring-2 focus:ring-[#00c0ff] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-400 bg-transparent text-white rounded focus:ring-2 focus:ring-[#00c0ff] focus:border-transparent"
                      required
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-[#00c0ff] text-black rounded-lg hover:bg-[#0e6c8b] transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </form>
              </div>
            </div>
        </div>

        {/* Payments Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#121212] rounded-lg shadow-lg overflow-hidden max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold">Payment History for {selectedUser.full_name || selectedUser.email}</h3>
                  <button
                    onClick={closePaymentsModal}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
                {paymentsLoading ? (
                  <p className="text-white">Loading payments...</p>
                ) : paymentsError ? (
                  <p className="text-red-500">{paymentsError}</p>
                ) : userPayments.length === 0 ? (
                  <p className="text-white">No payments found for this user.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-white">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stripe Session ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Currency</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Credits Added</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Payment Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-600">
                        {userPayments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{payment.stripe_session_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">${(payment.amount / 100).toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{payment.currency.toUpperCase()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{payment.credits_added}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{payment.payment_status}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{new Date(payment.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

  return (
    <div className="user-profile py-30">
      <div className="container mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-4xl font-medium text-center mb-5 sub-title inline-block">Super Admin Dashboard</h1>
          <p className="text-xl mb-16">Manage all users and system settings.</p>
        </div>
        <div className="bg-[#121212] rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">All Users</h2>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Full Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Phone Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Available Credit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Credit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.full_name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.available_credit || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.total_credit || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        <button
                          onClick={() => handleViewPayments(user)}
                          className="px-3 py-1 bg-[#00c0ff] text-black rounded hover:bg-[#0e6c8b] transition-colors"
                        >
                          View Payments
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Payments Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#121212] rounded-lg shadow-lg overflow-hidden max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold">Payment History for {selectedUser.full_name || selectedUser.email}</h3>
                  <button
                    onClick={closePaymentsModal}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
                {paymentsLoading ? (
                  <p className="text-white">Loading payments...</p>
                ) : paymentsError ? (
                  <p className="text-red-500">{paymentsError}</p>
                ) : userPayments.length === 0 ? (
                  <p className="text-white">No payments found for this user.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-white">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stripe Session ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Currency</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Credits Added</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Payment Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-600">
                        {userPayments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{payment.stripe_session_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">${(payment.amount / 100).toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{payment.currency.toUpperCase()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{payment.credits_added}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{payment.payment_status}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{new Date(payment.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
