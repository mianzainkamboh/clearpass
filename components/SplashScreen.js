import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Progress from 'react-native-progress';

const SplashScreen = ({ onAnimationFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    // Glow pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Simulate initialization process
    const timer = setTimeout(() => {
      if (onAnimationFinish) {
        onAnimationFinish();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, glowAnim, onAnimationFinish]);

  const glowInterpolation = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  return (
    <LinearGradient
      colors={['#0d1b2a', '#1b263b', '#415a77']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.logoContainer,
            { 
              opacity: fadeAnim,
              transform: [{ scale: glowInterpolation }] 
            }
          ]}
        >
          <Image
            source={require('../assets/shield-icon.png')}
            style={styles.logo}
          />
          <Text style={styles.subtitle}>Secure Login</Text>
        </Animated.View>

        <Text style={styles.title}>SecureAuth</Text>

        <View style={styles.loaderContainer}>
          <Progress.Circle 
            size={40} 
            indeterminate={true} 
            color="#4ea8de" 
            borderWidth={2}
          />
          <Text style={styles.loaderText}>Checking authentication...</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#4ea8de',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  subtitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 10,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  loaderText: {
    color: 'white',
    marginTop: 10,
    fontSize: 14,
  },
});

export default SplashScreen;