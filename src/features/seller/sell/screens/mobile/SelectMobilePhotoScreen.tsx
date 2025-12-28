import React from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SellMobileStackParamList as MobileStackParamList } from '../../navigation/SellMobileStack';
import PhotoUploadScreen from '../common/PhotoUploadScreen';

type SelectPhotoNavProp = NativeStackNavigationProp<MobileStackParamList, 'SelectPhoto'>;
type RouteProps = RouteProp<MobileStackParamList, 'SelectPhoto'>;

const SelectMobilePhotoScreen: React.FC = () => {
  const navigation = useNavigation<SelectPhotoNavProp>();
  const route = useRoute<RouteProps>();
  const { mobileId } = route.params;

  const handleSuccess = (images: string[]) => {
    navigation.navigate('MobilePricingScreen', { mobileId, images });
  };

  return (
    <PhotoUploadScreen
      entityType="mobile"
      entityId={mobileId}
      title="Upload Mobile Photos"
      maxPhotos={10}
      onBack={() => navigation.goBack()}
      onSuccess={handleSuccess}
    />
  );
};

export default SelectMobilePhotoScreen;
