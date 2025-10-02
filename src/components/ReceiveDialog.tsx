import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Share,
  Clipboard,
  Image,
} from 'react-native';
import { InteractionManager } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useWeb3Auth } from '../context/Web3AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NetworkToken } from '../services/tokenService';
import TokenAddressService, { TokenAddressInfo } from '../services/tokenAddressService';
import QRCode from 'react-native-qrcode-svg';

interface ReceiveDialogProps {
  visible: boolean;
  token: NetworkToken | null;
  onClose: () => void;
}

export const ReceiveDialog: React.FC<ReceiveDialogProps> = ({ visible, token, onClose }) => {
  const { theme } = useTheme();
  const { activeWallet, wallet, wallets } = useWeb3Auth();
  const [imageError, setImageError] = useState(false);
  const getTokenIconUrl = (idOrSymbol?: string | null) => {
    if (!idOrSymbol) return undefined;
    const key = String(idOrSymbol).toLowerCase();
    const map: Record<string, string> = {
      btc: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      eth: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      sol: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    };
    return map[key];
  };
  const [address, setAddress] = useState('');
  const [addressInfo, setAddressInfo] = useState<TokenAddressInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let interactionSub: any;

    const loadTokenAddress = async () => {
      if (!(visible && token)) return;
      setLoading(true);
      const currentWallet = activeWallet || wallet || (wallets && wallets.length > 0 ? wallets[0] : null);

      if (currentWallet && currentWallet.address) {
        try {
          const tokenAddressService = TokenAddressService.getInstance();
          const info = await tokenAddressService.getTokenAddressInfo(token, currentWallet.mnemonic);
          console.log('info', info);
          if (!isMounted) return;
          setAddress(info?.address);
          setAddressInfo(info || null);
        } catch (error) {
          console.error('Error loading token address:', error);
          if (!isMounted) return;
          setAddress('');
          setAddressInfo(null);
        }
      } else {
        if (!isMounted) return;
        setAddress('');
        setAddressInfo(null);
      }
      if (isMounted) setLoading(false);
    };

    if (visible) {
      interactionSub = InteractionManager.runAfterInteractions(() => {
        // Defer heavy work until after animations/gestures
        loadTokenAddress();
      });
    }

    return () => {
      isMounted = false;
      if (interactionSub && typeof interactionSub.cancel === 'function') {
        interactionSub.cancel();
      }
    };
  }, [visible, activeWallet, wallet, wallets, token]);


  const handleCopyAddress = async () => {
    try {
      await Clipboard.setString(address);
      Alert.alert('Copied', 'Address copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy address');
    }
  };

  const generateQRValue = (): string => {
    if (!address || !token) return '';
    
    // Generate QR code value based on token type
    switch (token.symbol.toUpperCase()) {
      case 'BTC':
        // Bitcoin QR code format
        return `bitcoin:${address}?amount=&label=${token.name}`;
      
      case 'ETH':
        // Ethereum QR code format
        return `ethereum:${address}`;
      
      case 'USDT':
      case 'USDC':
      case 'DAI':
        // ERC-20 token QR code format
        return `ethereum:${address}@1?uint256=0&address=${addressInfo?.contractAddress || ''}`;
      
      case 'ADA':
        // Cardano QR code format
        return `cardano:${address}`;
      
      case 'DOGE':
        // Dogecoin QR code format
        return `dogecoin:${address}`;
      
      case 'SOL':
        // Solana QR code format
        return `solana:${address}`;
      
      case 'XRP':
        // Ripple QR code format
        return `ripple:${address}`;
      
      default:
        // Default format
        return address;
    }
  };

  const handleShareQR = async () => {
    try {
      const networkInfo = addressInfo ? addressInfo.network : 'Unknown Network';
      const shareContent = {
        message: `Send ${token?.symbol} to: ${address}\n\nNetwork: ${networkInfo}`,
        title: `Receive ${token?.symbol}`,
      };
      await Share.share(shareContent);
    } catch (error) {
      Alert.alert('Error', 'Failed to share');
    }
  };


  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: 20,
      padding: 24,
      margin: 20,
      width: '90%',
      maxWidth: 400,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    backButton: {
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
    },
    tokenCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
    },
    tokenRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    tokenIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    tokenIconText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    tokenInfo: {
      flex: 1,
    },
    tokenSymbol: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    tokenName: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      backgroundColor: theme.colors.border,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    addressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    addressText: {
      fontSize: 14,
      color: theme.colors.text,
      fontFamily: 'monospace',
      flex: 1,
      marginRight: 12,
    },
    copyButton: {
      padding: 8,
    },
    qrContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    qrCode: {
      width: 200,
      height: 200,
      backgroundColor: '#000000',
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    qrCodeContainer: {
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    qrAddressText: {
      marginTop: 12,
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontFamily: 'monospace',
    },
    qrNetworkText: {
      marginTop: 4,
      fontSize: 10,
      color: theme.colors.textSecondary,
      opacity: 0.8,
    },
    qrPlaceholder: {
      width: 200,
      height: 200,
      backgroundColor: '#000000',
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    qrText: {
      color: '#FFFFFF',
      fontSize: 12,
      textAlign: 'center',
      paddingHorizontal: 20,
    },
    warningText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20,
    },
    shareButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
    },
    shareButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  if (!token) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onClose}
            >
              <Icon name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Receive</Text>
          </View>

          <View style={styles.tokenCard}>
            <View style={styles.tokenRow}>
              {!imageError && (getTokenIconUrl(token?.id) || getTokenIconUrl(token?.symbol)) ? (
                <Image 
                  source={{ uri: (getTokenIconUrl(token?.id) || getTokenIconUrl(token?.symbol)) as string }} 
                  style={[styles.tokenIcon, { borderRadius: 14 }]} 
                  onError={() => setImageError(true)}
                />
              ) : (
                <View style={[styles.tokenIcon, { backgroundColor: (token?.color || '#999') + '33' }]}>
                  <Text style={{ color: token?.color || '#999', fontWeight: '800' }}>{token?.symbol?.charAt(0)}</Text>
                </View>
              )}
              <View style={styles.tokenInfo}>
                <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                <Text style={styles.tokenName}>{token.name}</Text>
              </View>
            </View>
            
            <View style={styles.addressRow}>
              <Text style={styles.addressText}>
                {loading ? 'Loading address...' : 
                 address ? `${address.slice(0, 10)}...${address.slice(-10)}` : 
                 'No wallet address'}
              </Text>
              {address && !loading && (
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={handleCopyAddress}
                >
                  <Icon name="content-copy" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.qrContainer}>
            {address ? (
              <View style={styles.qrCodeContainer}>
                <QRCode
                  value={generateQRValue()}
                  size={200}
                  color="#000000"
                  backgroundColor="#FFFFFF"
                  logoSize={30}
                  logoMargin={2}
                  logoBorderRadius={15}
                  quietZone={10}
                />
                <Text style={styles.qrAddressText}>
                  {address.slice(0, 8)}...{address.slice(-8)}
                </Text>
                <Text style={styles.qrNetworkText}>
                  {addressInfo ? addressInfo.network : 'Unknown Network'}
                </Text>
              </View>
            ) : (
              <View style={styles.qrPlaceholder}>
                <Text style={styles.qrText}>
                  No QR Code{'\n'}
                  No wallet address available
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.warningText}>
            Only send <Text style={{ fontWeight: 'bold' }}>{token.symbol}</Text> Asset to this address{'\n'}
            <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
              Network: {addressInfo ? addressInfo.network : 'Unknown Network'}
            </Text>
          </Text>

          <TouchableOpacity
            style={[styles.shareButton, !address && { opacity: 0.5 }]}
            onPress={address ? handleShareQR : () => Alert.alert('No Address', 'No wallet address available to share')}
            disabled={!address}
          >
            <Text style={styles.shareButtonText}>Share QR Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ReceiveDialog;