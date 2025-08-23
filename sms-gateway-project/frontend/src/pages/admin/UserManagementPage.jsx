import React, { useEffect, useState } from 'react';
import { Modal, Box, TextField, FormControlLabel, Checkbox } from '@mui/material';
import apiService from '../../services/apiService.js';
import UserActionsDropdown from '../../components/UserActionsDropdown.jsx';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  backgroundColor: 'white',
  padding: '16px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0,0, 0.1)',
};

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [extension, setExtension] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [dailyQuota, setDailyQuota] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const fetchUsers = async () => {
    const data = await apiService.getUsers();
    const formatted = data.map((u) => ({
      id: u.ID,
      username: u.Username,
      name: u.Name,
      phone: u.Phone,
      extension: u.Extension,
      department: u.Department,
      api_key: u.APIKey,
      daily_quota: u.DailyQuota,
      is_admin: u.IsAdmin,
      is_active: u.IsActive
    }));
    setUsers(formatted);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setUsername('');
    setName('');
    setPhone('');
    setExtension('');
    setDepartment('');
    setPassword('');
    setApiKey('');
    setDailyQuota('');
    setIsAdmin(false);
    setIsActive(true);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    resetForm();
    setOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingId(user.id);
    setUsername(user.username);
    setName(user.name);
    setPhone(user.phone);
    setExtension(user.extension);
    setDepartment(user.department);
    setPassword('');
    setApiKey(user.api_key);
    setDailyQuota(user.daily_quota);
    setIsAdmin(user.is_admin);
    setIsActive(user.is_active);
    setOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      username,
      name,
      phone,
      extension,
      department,
      password,
      api_key: apiKey,
      daily_quota: dailyQuota ? parseInt(dailyQuota, 10) : null, // Convert to number or null
      is_admin: isAdmin,
      is_active: isActive
    };
    if (editingId) {
      await apiService.updateUser(editingId, payload);
    } else {
      await apiService.createUser(payload);
    }
    setOpen(false);
    resetForm();
    setEditingId(null);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    await apiService.deleteUser(id);
    fetchUsers();
  };

  const handleToggleActive = async (user) => {
    if (user.is_active) {
      await apiService.deactivateUser(user.id);
    } else {
      await apiService.activateUser(user.id);
    }
    fetchUsers();
  };


  return (
    <div className="layout-content-container flex flex-col flex-1">
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <div className="flex min-w-72 flex-col gap-3">
          <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight">User Management</p>
          <p className="text-[#60758a] text-sm font-normal leading-normal">Manage users and their access levels within the SMS Gateway system.</p>
        </div>
        <button
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#f0f2f5] text-[#111418] text-sm font-medium leading-normal"
          onClick={handleOpenCreate}
        >
          <span className="truncate">Add User</span>
        </button>
      </div>

      <div className="px-4 py-3">
        <label className="flex flex-col min-w-40 h-12 w-full">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
            <div
              className="text-[#60758a] flex border-none bg-[#f0f2f5] items-center justify-center pl-4 rounded-l-lg border-r-0"
              data-icon="MagnifyingGlass"
              data-size="24px"
              data-weight="regular"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                <path
                  d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
                ></path>
              </svg>
            </div>
            <input
              placeholder="Search users..."
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-full placeholder:text-[#60758a] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
              value=""
            />
          </div>
        </label>
      </div>

      <div className="px-4 py-3 @container">
        <div className="flex rounded-lg border border-[#dbe0e6] bg-white">
          <table className="flex-1">
            <thead>
              <tr className="bg-white">
                <th className="table-55634cf7-bf2b-479a-bbea-4aaef2adb094-column-120 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">Name</th>
                <th className="table-55634cf7-bf2b-479a-bbea-4aaef2adb094-column-240 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">Username</th>
                <th className="table-55634cf7-bf2b-479a-bbea-4aaef2adb094-column-360 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">Phone</th>
                <th className="table-55634cf7-bf2b-479a-bbea-4aaef2adb094-column-480 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">Extension</th>
                <th className="table-55634cf7-bf2b-479a-bbea-4aaef2adb094-column-600 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">Department</th>
                <th className="table-55634cf7-bf2b-479a-bbea-4aaef2adb094-column-720 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">API Key</th>
                <th className="table-55634cf7-bf2b-479a-bbea-4aaef2adb094-column-840 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">Daily Quota</th>
                <th className="table-55634cf7-bf2b-479a-bbea-4aaef2adb094-column-960 px-4 py-3 text-left text-[#111418] w-60 text-sm font-medium leading-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-t-[#dbe0e6]">
                  <td className="table-55634cf7-bf2b-479a-bbea-4aaef2adb094-column-120 h-[72px] px-4 py-2 w-[400px] text-[#111418] text-sm font-normal leading-normal">{user.name}</td>
                  <td className="table-55634cf7-bf2b-479a-bbea-4aaef2adb094-column-240 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">{user.username}</td>
                  <td className="table-55634cf7-bf2b-479a-bbea-4aaef2adb094-column-360 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">{user.phone}</td>
                  <td className="table-55634cf7-bf2b-479a-bbea-4aaef2adb094-column-480 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">{user.extension}</td>
                  <td className="table-55634cf7-bf2b-479a-bbea-4aaef2adb094-column-600 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">{user.department}</td>
                  <td className="table-55634cf7-bf2b-479a-bbea-4aaef2adb094-column-720 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">{user.api_key}</td>
                  <td className="table-55634cf7-bf2b-479a-bbea-4aaef2adb094-column-840 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">{user.daily_quota}</td>
                  <td className="table-55634cf7-bf2b-479a-bbea-4aaef2adb094-column-960 h-[72px] px-4 py-2 w-60 text-[#60758a] text-sm font-bold leading-normal tracking-[0.015em] relative">
                    <UserActionsDropdown user={user} handleOpenEdit={handleOpenEdit} handleToggleActive={handleToggleActive} handleDelete={handleDelete} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <style>{`
            @container(max-width:120px){.table-55634cf7-bf2b-479a-bbea-4aaef2adb094-column-120{display: none;}}
            @container(max-width:240px){.table-55634cf7-bf2b-479a-bbea-4aaef2adb094-column-240{display: none;}}
            @container(max-width:360px){.table-55634cf7-bf2b-479a-bbea-4aaef2adb094-column-360{display: none;}}
            @container(max-width:480px){.table-55634cf7-bf2b-479a-bbea-4aaef2adb094-column-480{display: none;}}
            @container(max-width:600px){.table-55634cf7-bf2b-479a-bbea-4aaef2adb094-column-600{display: none;}}
            @container(max-width:720px){.table-55634cf7-bf2b-479a-bbea-4aaef2adb094-column-720{display: none;}}
            @container(max-width:840px){.table-55634cf7-bf2b-479a-bbea-4aaef2adb094-column-840{display: none;}}
            @container(max-width:960px){.table-55634cf7-bf2b-479a-bbea-4aaef2adb094-column-960{display: none;}}
            @container(max-width:1080px){.table-55634cf7-bf2b-479a-bbea-4aaef2adb094-column-1080{display: none;}}
          `}</style>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={modalStyle}>
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit User' : 'Create User'}</h2>
          <TextField label="Username *" fullWidth margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} />
          <TextField label="Name" fullWidth margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Phone" fullWidth margin="normal" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <TextField label="Extension" fullWidth margin="normal" value={extension} onChange={(e) => setExtension(e.target.value)} />
          <TextField label="Department" fullWidth margin="normal" value={department} onChange={(e) => setDepartment(e.target.value)} />
          <TextField label="Password *" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
          <TextField label="API Key" fullWidth margin="normal" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          <TextField label="Daily Quota" fullWidth margin="normal" value={dailyQuota} onChange={(e) => setDailyQuota(e.target.value)} />
          <FormControlLabel control={<Checkbox checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />} label="Admin" />
          <FormControlLabel control={<Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />} label="Active" />
          <button
            className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleSave}
          >
            Save
          </button>
          <button
            className="mt-4 ml-2 border border-gray-300 text-gray-700 hover:bg-gray-100 py-2 px-4 rounded"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
        </Box>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
