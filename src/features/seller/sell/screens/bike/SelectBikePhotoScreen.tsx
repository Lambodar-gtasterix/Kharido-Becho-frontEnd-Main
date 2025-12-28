import React from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SellBikeStackParamList } from '../../navigation/SellBikeStack';
import PhotoUploadScreen from '../common/PhotoUploadScreen';

type SelectPhotoNavProp = NativeStackNavigationProp<SellBikeStackParamList, 'SelectPhoto'>;
type RouteProps = RouteProp<SellBikeStackParamList, 'SelectPhoto'>;

const SelectBikePhotoScreen: React.FC = () => {
  const navigation = useNavigation<SelectPhotoNavProp>();
  const route = useRoute<RouteProps>();
  const { bikeId } = route.params;

  const handleSuccess = (images: string[]) => {
    navigation.navigate('BikePricingScreen', { bikeId, images });
  };

  return (
    <PhotoUploadScreen
      entityType="bike"
      entityId={bikeId}
      title="Upload Bike Photos"
      maxPhotos={10}
      onBack={() => navigation.goBack()}
      onSuccess={handleSuccess}
    />
  );
};

export default SelectBikePhotoScreen;
