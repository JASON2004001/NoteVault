import React from 'react';
import { useSelector } from 'react-redux';
import AuthView from './components/AuthView';
import VaultDashboard from './components/VaultDashboard';

export default function App() {
  const { token } = useSelector((state) => state.auth);

  if (!token) {
    return <AuthView />;
  }

  return <VaultDashboard />;
}