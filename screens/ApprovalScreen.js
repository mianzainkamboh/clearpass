import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { mobileLogin, logoutUser } from '../services/apiService';

const { width, height } = Dimensions.get('window');

export default function ApprovalScreen({ route, navigation }) {
  const { tempLoginToken } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [rejected, setRejected] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
    
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    
    return () => pulseAnimation.stop();
  }, []);

  const handleApprove = async () => {
    if (!tempLoginToken) {
      Alert.alert('Error', 'No temp login token found');
      return;
    }

    setLoading(true);
    try {
      const result = await mobileLogin(tempLoginToken);
      
      if (result.success) {
        setResponse(result.data);
      } else {
        // Handle validation errors and other API errors
        Alert.alert(
          'Approval Failed', 
          result.error || 'Failed to approve login',
          [{ text: 'OK', onPress: () => setLoading(false) }]
        );
        return;
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to approve login');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () => {
    setRejected(true);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to logout');
    }
  };

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  if (rejected) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
              }
            ]}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.statusIcon}>❌</Text>
            </View>
            <Text style={styles.title}>Request Rejected</Text>
            <Text style={styles.message}>The login request has been rejected successfully</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleGoHome}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.primaryButtonText}>Back to Home</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleLogout}>
                <Text style={styles.secondaryButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (response) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
              }
            ]}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.statusIcon}>✅</Text>
            </View>
            <Text style={styles.title}>Login Approved</Text>
            <Text style={styles.message}>The login request has been approved successfully</Text>
            <View style={styles.responseContainer}>
              <Text style={styles.responseLabel}>Response:</Text>
              <Text style={styles.responseText}>{response}</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleGoHome}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.primaryButtonText}>Back to Home</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleLogout}>
                <Text style={styles.secondaryButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.iconContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <Text style={styles.requestIcon}>🔐</Text>
          </Animated.View>
          
          <Text style={styles.title}>Security Request</Text>
          <Text style={styles.message}>
            A login request has been detected. Please review and choose your action.
          </Text>
          
          {tempLoginToken && (
            <View style={styles.tokenContainer}>
              <Text style={styles.tokenLabel}>Authentication Token:</Text>
              <Text style={styles.tokenText}>{tempLoginToken}</Text>
            </View>
          )}
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="white" style={styles.loader} />
              <Text style={styles.loadingText}>Processing request...</Text>
            </View>
          ) : (
            <View style={styles.actionContainer}>
              <TouchableOpacity style={styles.approveButton} onPress={handleApprove}>
                <LinearGradient
                  colors={['#4CAF50', '#45a049']}
                  style={styles.actionButtonGradient}
                >
                  <Text style={styles.approveButtonText}>✓ Approve</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
                <LinearGradient
                  colors={['#f44336', '#d32f2f']}
                  style={styles.actionButtonGradient}
                >
                  <Text style={styles.rejectButtonText}>✗ Reject</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusIcon: {
    fontSize: 50,
  },
  requestIcon: {
    fontSize: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  message: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  tokenContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tokenLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    textAlign: 'center',
  },
  tokenText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  responseContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  responseLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    textAlign: 'center',
  },
  responseText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  loader: {
    marginBottom: 15,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actionContainer: {
    width: '100%',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 30,
  },
  approveButton: {
    marginBottom: 15,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  rejectButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#f44336',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  approveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rejectButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  primaryButton: {
    marginBottom: 15,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoutButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
});