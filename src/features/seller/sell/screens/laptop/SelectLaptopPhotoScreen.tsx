import React from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SellLaptopStackParamList } from '../../navigation/SellLaptopStack';
import PhotoUploadScreen from '../common/PhotoUploadScreen';

type SelectLaptopPhotoNav = NativeStackNavigationProp<
  SellLaptopStackParamList,
  'SelectLaptopPhotoScreen'
>;
type SelectLaptopPhotoRoute = RouteProp<SellLaptopStackParamList, 'SelectLaptopPhotoScreen'>;

const SelectLaptopPhotoScreen: React.FC = () => {
  const navigation = useNavigation<SelectLaptopPhotoNav>();
  const route = useRoute<SelectLaptopPhotoRoute>();
  const { laptopId } = route.params;

  const handleSuccess = (images: string[]) => {
    navigation.replace('LaptopPricingScreen', { laptopId, images });
  };

  return (
    <PhotoUploadScreen
      entityType="laptop"
      entityId={laptopId}
      title="Upload Laptop Photos"
      maxPhotos={10}
      onBack={() => navigation.goBack()}
      onSuccess={handleSuccess}
    />
  );
};

export default SelectLaptopPhotoScreen;
