"use client";
import React, { useState, useEffect } from 'react';
import VaultModel from './models/vaultModel';
import VaultController from './controllers/vaultController';
import LandingPage from './components/LandingPage';
import VaultDashboard from './components/VaultDashboard';

const GasTankVault = () => {
  const [model] = useState(() => new VaultModel());
  const [controller] = useState(() => new VaultController(model));
  const [, forceUpdate] = useState({});
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    controller.subscribe(() => forceUpdate({}));
  }, [controller]);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    await controller.connectWallet();
    setIsConnecting(false);
  };

  if (!model.wallet) {
    return (
      <LandingPage
        onConnectWallet={handleConnectWallet}
        isConnecting={isConnecting}
      />
    );
  }

  return (
    <VaultDashboard
      model={model}
      controller={controller}
    />
  );
};

export default GasTankVault;
