import React, { useState } from 'react';
import { View } from 'react-native';
import { SendDialog } from '../../components/SendDialog';
import { NetworkToken } from '../../services/tokenService';

interface SendScreenProps {
  navigation: any;
  route: any;
}

export const SendScreen: React.FC<SendScreenProps> = ({ navigation, route }) => {
  const [showDialog, setShowDialog] = useState(true);
  const token = route.params?.token as NetworkToken;

  const handleCloseDialog = () => {
    setShowDialog(false);
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1 }}>
      {token && (
        <SendDialog
          visible={showDialog}
          token={token}
          onClose={handleCloseDialog}
        />
      )}
    </View>
  );
};
