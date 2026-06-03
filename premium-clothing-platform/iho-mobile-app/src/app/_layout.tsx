import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css'; // NativeWind CSS import (fixed path)

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      {/* Stack Navigator: Yeh un screens ko manage karega jinme bottom bar nahi chahiye (jaise checkout) */}
      <Stack screenOptions={{ headerShown: false }}>

        {/* Yeh line aapke naye (tabs) folder ko call karti hai */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Bachi hui full-screen pages automatically handle ho jayengi */}
      </Stack>
    </>
  );
}