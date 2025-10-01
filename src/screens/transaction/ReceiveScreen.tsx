import React, { useState } from 'react';
import { View } from 'react-native';
import ReceiveDialog from '../../components/ReceiveDialog';
import { NetworkToken } from '../../services/tokenService';

interface ReceiveScreenProps {
  navigation: any;
  route: any;
}

export const ReceiveScreen: React.FC<ReceiveScreenProps> = ({ navigation, route }) => {
  const [showDialog, setShowDialog] = useState(true);
  const token = route.params?.token as NetworkToken;

  const handleCloseDialog = () => {
    setShowDialog(false);
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1 }}>
      <ReceiveDialog
        visible={showDialog}
        token={token}
        onClose={handleCloseDialog}
      />
    </View>
  );
};

export default ReceiveScreen;
