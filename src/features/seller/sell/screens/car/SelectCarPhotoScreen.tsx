import React from 'react';
import { Alert } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SellCarStackParamList } from '../../navigation/SellCarStack';
import PhotoUploadScreen from '../common/PhotoUploadScreen';

type SelectPhotoNavProp = NativeStackNavigationProp<SellCarStackParamList, 'SelectPhoto'>;
type RouteProps = RouteProp<SellCarStackParamList, 'SelectPhoto'>;

const SelectCarPhotoScreen: React.FC = () => {
  const navigation = useNavigation<SelectPhotoNavProp>();
  const route = useRoute<RouteProps>();
  const { carId } = route.params;

  // Validate carId on mount
  React.useEffect(() => {
    if (!carId) {
      Alert.alert('Error', 'Missing car ID. Please go back and try again.', [
        { text: 'Go Back', onPress: () => navigation.goBack() },
      ]);
    }
  }, [carId, navigation]);

  const handleSuccess = (images: string[]) => {
    navigation.navigate('CarPricingScreen', { carId, images });
  };

  return (
    <PhotoUploadScreen
      entityType="car"
      entityId={carId}
      title="Upload Car Photos"
      maxPhotos={10}
      onBack={() => navigation.goBack()}
      onSuccess={handleSuccess}
    />
  );
};

export default SelectCarPhotoScreen;
