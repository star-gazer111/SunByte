
const express = require('express');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 8080;
app.use(express.json());


const KEYSTORE_DIR = path.join(__dirname, '.keystore');
if (!fs.existsSync(KEYSTORE_DIR)) {
  fs.mkdirSync(KEYSTORE_DIR);
  console.log('Created keystore directory at:', KEYSTORE_DIR);
}

function getProvider() {
  const rpcUrl = process.env.ETH_RPC_URL;
  if (!rpcUrl) {
    throw new Error("FATAL: ETHEREUM_RPC_URL is not defined in your .env file.");
  }
  return new ethers.JsonRpcProvider(rpcUrl);
}



app.post('/wallet/create', async (req, res) => {
  console.log('Received request to /wallet/create');
  try {
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password is required (min 8 characters).' });
    }
    const wallet = ethers.Wallet.createRandom();
    const encryptedJson = await wallet.encrypt(password);
    const filePath = path.join(KEYSTORE_DIR, `${wallet.address}.json`);
    fs.writeFileSync(filePath, encryptedJson);
    console.log(`Successfully created wallet: ${wallet.address}`);
    res.status(201).json({
      message: 'Wallet created successfully. SECURELY BACK UP YOUR MNEMONIC PHRASE!',
      address: wallet.address,
      mnemonic: wallet.mnemonic.phrase,
    });
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});


app.post('/wallet/pvt_key/retrieve', async (req, res) => {
  console.log('Received request to /wallet/pvt_key/retrieve');
  try {
      const { address, password } = req.body;

      if (!address || !ethers.isAddress(address)) {
          return res.status(400).json({ error: 'A valid wallet address is required.' });
      }

      if (!password || password.length < 8) {
          return res.status(400).json({ error: 'Password is required (min 8 characters).' });
      }

      const filePath = path.join(KEYSTORE_DIR, `${address}.json`);
      if (!fs.existsSync(filePath)) {
          return res.status(404).json({ error: `Wallet for address ${address} not found.` });
      }

      try {
          const encryptedJson = fs.readFileSync(filePath, 'utf8');
          const wallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, password);

          console.log(`Private key retrieved for wallet: ${wallet.address}`);
          return res.status(200).json({
              message: 'Private key retrieved successfully!',
              address: wallet.address,
              privateKey: wallet.privateKey
          });

      } catch (err) {
          return res.status(401).json({ error: 'Invalid password.' });
      }

  } catch (error) {
      console.error('Error retrieving wallet private key:', error);
      res.status(500).json({ error: 'An internal server error occurred.' });
  }
});



app.post('/wallet/import-mnemonic', async (req, res) => {
  console.log('Received request to /wallet/import-mnemonic');
  try {
    const { mnemonic, password } = req.body;
    if (!password || password.length < 8) {
        return res.status(400).json({ error: 'Password is required (min 8 characters).' });
    }
    if (!mnemonic || !ethers.Mnemonic.isValidMnemonic(mnemonic)) {
        return res.status(400).json({ error: 'A valid 12 or 24-word mnemonic phrase is required.' });
    }
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    const filePath = path.join(KEYSTORE_DIR, `${wallet.address}.json`);
    if (fs.existsSync(filePath)) {
        return res.status(409).json({ error: `Wallet for this address (${wallet.address}) already exists.`});
    }
    const encryptedJson = await wallet.encrypt(password);
    fs.writeFileSync(filePath, encryptedJson);
    console.log(`Successfully imported wallet from mnemonic: ${wallet.address}`);
    res.status(201).json({ message: 'Wallet imported successfully!', address: wallet.address });
  } catch (error) {
    console.error('Error importing wallet from mnemonic:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});


app.post('/wallet/import-private-key', async (req, res) => {
    console.log('Received request to /wallet/import-private-key');
    try {
        const { privateKey, password } = req.body;
        if (!password || password.length < 8) {
            return res.status(400).json({ error: 'Password is required (min 8 characters).' });
        }
        if (!privateKey || !/^(0x)?[0-9a-fA-F]{64}$/.test(privateKey)) {
            return res.status(400).json({ error: 'A valid 64-character hex private key is required.' });
        }

        const wallet = new ethers.Wallet(privateKey);
        const filePath = path.join(KEYSTORE_DIR, `${wallet.address}.json`);
        if (fs.existsSync(filePath)) {
            return res.status(409).json({ error: `Wallet for this address (${wallet.address}) already exists.`});
        }

        const encryptedJson = await wallet.encrypt(password);
        fs.writeFileSync(filePath, encryptedJson);

        console.log(`Successfully imported wallet from private key: ${wallet.address}`);
        res.status(201).json({ message: 'Wallet imported successfully!', address: wallet.address });

    } catch (error) {
        console.error('Error importing wallet from private key:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});


app.get('/wallet/:address/balance', async (req, res) => {
  console.log(`Received request to /wallet/${req.params.address}/balance`);
  try {
    const { address } = req.params;
    if (!ethers.isAddress(address)) {
        return res.status(400).json({ error: 'Invalid Ethereum address provided.' });
    }
    const provider = getProvider();
    const balanceWei = await provider.getBalance(address);
    const balanceEth = ethers.formatEther(balanceWei);
    console.log(`Balance for ${address}: ${balanceEth} ETH`);
    res.status(200).json({ address, balance: balanceEth });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});


app.post('/wallet/prepare-transaction', async (req, res) => {
    console.log('Received request to /wallet/prepare-transaction');
    try {
        const { fromAddress, toAddress, amount } = req.body;
        if (!fromAddress || !toAddress || !amount) {
            return res.status(400).json({ error: 'Missing required fields: fromAddress, toAddress, amount.' });
        }
        const provider = getProvider();
        const nonce = await provider.getTransactionCount(fromAddress, "latest");
        const feeData = await provider.getFeeData();
        const network = await provider.getNetwork();
        const unsignedTx = {
            to: toAddress,
            value: ethers.parseEther(amount),
            gasLimit: 21000,
            maxFeePerGas: feeData.maxFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
            nonce: nonce,
            chainId: network.chainId,
            type: 2
        };
        const safeTx = JSON.parse(JSON.stringify(unsignedTx, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
          ));
          
          res.status(200).json({
            message: "Unsigned transaction prepared for review.",
            unsignedTx: safeTx
          });
    } catch (error) {
        console.error('Error preparing transaction:', error);
        res.status(500).json({ error: 'Failed to prepare transaction.', details: error.message });
    }
});


app.post('/wallet/sign-and-broadcast', async (req, res) => {
    console.log('Received request to /wallet/sign-and-broadcast');
    try {
        const { fromAddress, password, unsignedTx } = req.body;
        if (!fromAddress || !password || !unsignedTx) {
            return res.status(400).json({ error: 'Missing required fields: fromAddress, password, unsignedTx.' });
        }
        const keystorePath = path.join(KEYSTORE_DIR, `${fromAddress}.json`);
        if (!fs.existsSync(keystorePath)) {
            return res.status(404).json({ error: `Wallet for address ${fromAddress} not found.` });
        }
        const encryptedJson = fs.readFileSync(keystorePath, 'utf8');
        let senderWallet;
        try {
            senderWallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, password);
        } catch (e) {
            return res.status(401).json({ error: 'Invalid password.' });
        }
        const signedTx = await senderWallet.signTransaction(unsignedTx);
        const provider = getProvider();
        const txResponse = await provider.broadcastTransaction(signedTx);
        console.log(`Transaction sent! Hash: ${txResponse.hash}`);
        const receipt = await txResponse.wait();
        console.log('Transaction confirmed!');
        res.status(200).json({
            message: 'Transaction signed and confirmed!',
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber
        });
    } catch (error) {
        console.error('Error in sign-and-broadcast:', error);
        if (error.code === 'INSUFFICIENT_FUNDS') {
            return res.status(400).json({ error: 'Insufficient funds for transaction.' });
        }
        res.status(500).json({ error: 'An internal server error occurred.', details: error.message });
    }
});

app.post('/wallet/sign-message', async (req, res) => {
    console.log('Received request to /wallet/sign-message');
    try {
        const { fromAddress, password, message } = req.body;
        if (!fromAddress || !password || !message) {
            return res.status(400).json({ error: 'Missing required fields: fromAddress, password, message.' });
        }
        const keystorePath = path.join(KEYSTORE_DIR, `${fromAddress}.json`);
        if (!fs.existsSync(keystorePath)) {
            return res.status(404).json({ error: `Wallet for address ${fromAddress} not found.` });
        }
        const encryptedJson = fs.readFileSync(keystorePath, 'utf8');
        let senderWallet;
        try {
            senderWallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, password);
        } catch (e) {
            return res.status(401).json({ error: 'Invalid password.' });
        }

        // Sign the message
        const signature = await senderWallet.signMessage(message);
        console.log(`Message signed for ${fromAddress}`);

        // Ensure signature is in proper format (add 0x prefix if missing)
        const formattedSignature = signature.startsWith('0x') ? signature : `0x${signature}`;

        res.status(200).json({
            message: 'Message signed successfully!',
            signature: formattedSignature
        });
    } catch (error) {
        console.error('Error in sign-message:', error);
        res.status(500).json({ error: 'An internal server error occurred.', details: error.message });
    }
});

app.post('/wallet/sign-typed-data', async (req, res) => {
    console.log('Received request to /wallet/sign-typed-data');
    try {
        const { fromAddress, password, typedData } = req.body;
        if (!fromAddress || !password || !typedData) {
            return res.status(400).json({ error: 'Missing required fields: fromAddress, password, typedData.' });
        }

        // Parse typedData if it's a string (from Web3 requests)
        let parsedTypedData = typedData;
        if (typeof typedData === 'string') {
            try {
                parsedTypedData = JSON.parse(typedData);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid typed data format.' });
            }
        }

        // Validate typed data structure
        if (!parsedTypedData.domain || !parsedTypedData.types) {
            return res.status(400).json({ error: 'Typed data must include domain and types.' });
        }

        // Handle both EIP-712 structures (Web3 uses 'message', ethers.js uses 'value')
        const typedMessage = parsedTypedData.message || parsedTypedData.value;
        if (!typedMessage) {
            return res.status(400).json({ error: 'Typed data must include message or value.' });
        }

        // Filter out EIP712Domain from types (ethers.js handles this automatically)
        const { EIP712Domain, ...filteredTypes } = parsedTypedData.types;
        const signingTypes = Object.keys(filteredTypes).length > 0 ? filteredTypes : parsedTypedData.types;
        const keystorePath = path.join(KEYSTORE_DIR, `${fromAddress}.json`);
        if (!fs.existsSync(keystorePath)) {
            return res.status(404).json({ error: `Wallet for address ${fromAddress} not found.` });
        }
        const encryptedJson = fs.readFileSync(keystorePath, 'utf8');
        let senderWallet;
        try {
            senderWallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, password);
        } catch (e) {
            return res.status(401).json({ error: 'Invalid password.' });
        }

        // Sign the typed data
        const signature = await senderWallet.signTypedData(
            parsedTypedData.domain,
            signingTypes,
            typedMessage
        );
        console.log(`Typed data signed for ${fromAddress}`);

        // Ensure signature is in proper format (add 0x prefix if missing)
        const formattedSignature = signature.startsWith('0x') ? signature : `0x${signature}`;

        // Optional: Execute contract interaction if contract details are provided
        let contractResult = null;
        if (parsedTypedData.contractInteraction) {
            try {
                const { contractAddress, method, params, value = '0' } = parsedTypedData.contractInteraction;
                const provider = getProvider();

                // Create contract interface
                const contract = new ethers.Contract(contractAddress, [method], senderWallet);

                console.log(`Executing contract interaction: ${method.name} at ${contractAddress}`);

                // Execute the contract method
                const txResponse = await contract[method.name](...params, {
                    value: ethers.parseEther(value.toString()),
                    gasLimit: 200000
                });

                console.log(`Contract transaction sent: ${txResponse.hash}`);
                const receipt = await txResponse.wait();
                contractResult = {
                    txHash: receipt.hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString()
                };
                console.log('Contract interaction confirmed');

            } catch (contractError) {
                console.warn('Error executing contract interaction:', contractError.message);
                // Don't fail the whole request if contract interaction fails
            }
        }

        res.status(200).json({
            message: 'Typed data signed successfully!',
            signature: formattedSignature
        });
    } catch (error) {
        console.error('Error in sign-typed-data:', error);
        res.status(500).json({ error: 'An internal server error occurred.', details: error.message });
    }
});

app.listen(port, () => {
  console.log(`wallet-api server is running on http://localhost:${port}`);
});