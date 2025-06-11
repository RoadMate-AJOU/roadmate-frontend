 import { Button } from 'react-native';
 import { router } from 'expo-router';
 import LocationConsent from '../../screens/consent/LocationConsent';

 export default function LocationConsentPage() {
   const handleAgree = () => {
     router.replace('/(tabs)');
   };

   return (
     <>
       <LocationConsent />
       <Button title="동의하기" onPress={handleAgree} />
     </>
   );
 }
