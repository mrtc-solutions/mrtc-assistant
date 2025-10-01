import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import * as Contacts from 'expo-contacts';
import * as Location from 'expo-location';
import * as Camera from 'expo-camera';
import * as Notifications from 'expo-notifications';
import * as FileSystem from 'expo-file-system';

export default function PhoneAssistant() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsNumber, setSmsNumber] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [location, setLocation] = useState(null);
  const [contacts, setContacts] = useState([]);

  // Request all permissions on app start
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      // Request contacts permission
      const { status: contactsStatus } = await Contacts.requestPermissionsAsync();
      
      // Request location permission
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      
      // Request camera permission
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      
      // Request notification permission
      const { status: notifStatus } = await Notifications.requestPermissionsAsync();
      
      console.log('Permissions granted!');
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  // Make actual phone call
  const makePhoneCall = () => {
    if (phoneNumber) {
      // This will open native dialer
      Linking.openURL(`tel:${phoneNumber}`)
        .then(() => console.log('Dialer opened'))
        .catch(err => Alert.alert('Error', 'Cannot make call: ' + err.message));
    } else {
      Alert.alert('Error', 'Please enter a phone number');
    }
  };

  // Send actual SMS
  const sendSMS = () => {
    if (smsNumber && smsMessage) {
      // This will open native SMS app
      Linking.openURL(`sms:${smsNumber}?body=${encodeURIComponent(smsMessage)}`)
        .then(() => console.log('SMS app opened'))
        .catch(err => Alert.alert('Error', 'Cannot send SMS: ' + err.message));
    } else {
      Alert.alert('Error', 'Please enter both number and message');
    }
  };

  // Access actual contacts
  const accessContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        });

        if (data.length > 0) {
          setContacts(data);
          Alert.alert('Success', `Found ${data.length} contacts\n\nFirst contact: ${data[0].name}`);
        } else {
          Alert.alert('Info', 'No contacts found');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Cannot access contacts: ' + error.message);
    }
  };

  // Get actual location
  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        Alert.alert('Location Found', 
          `Latitude: ${location.coords.latitude.toFixed(4)}\nLongitude: ${location.coords.longitude.toFixed(4)}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Cannot get location: ' + error.message);
    }
  };

  // Send notification
  const sendNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "MRTC Assistant",
        body: "This is a notification from your phone assistant!",
      },
      trigger: null, // Send immediately
    });
    Alert.alert('Success', 'Notification sent!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📱 MRTC Phone Assistant</Text>
        <Text style={styles.subtitle}>Full Phone Access</Text>
      </View>

      {/* Phone Call */}
      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>📞 Make Phone Call</Text>
        <Text>Enter number and tap "Call" to open dialer</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter phone number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        <TouchableOpacity style={styles.button} onPress={makePhoneCall}>
          <Text style={styles.buttonText}>Call Number</Text>
        </TouchableOpacity>
      </View>

      {/* Send SMS */}
      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>💬 Send SMS</Text>
        <Text>Compose message and tap "Send SMS"</Text>
        <TextInput
          style={styles.input}
          placeholder="Phone number"
          value={smsNumber}
          onChangeText={setSmsNumber}
          keyboardType="phone-pad"
        />
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Your message here..."
          value={smsMessage}
          onChangeText={setSmsMessage}
          multiline
        />
        <TouchableOpacity style={styles.button} onPress={sendSMS}>
          <Text style={styles.buttonText}>Send SMS</Text>
        </TouchableOpacity>
      </View>

      {/* Contacts */}
      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>👥 Access Contacts</Text>
        <Text>Tap to access your phone contacts</Text>
        <TouchableOpacity style={styles.button} onPress={accessContacts}>
          <Text style={styles.buttonText}>Get My Contacts</Text>
        </TouchableOpacity>
        <Text style={styles.infoText}>Contacts found: {contacts.length}</Text>
      </View>

      {/* Location */}
      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>📍 Get Location</Text>
        <Text>Tap to get your current GPS location</Text>
        <TouchableOpacity style={styles.button} onPress={getLocation}>
          <Text style={styles.buttonText}>Get My Location</Text>
        </TouchableOpacity>
        {location && (
          <Text style={styles.infoText}>
            Location: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
          </Text>
        )}
      </View>

      {/* Notifications */}
      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>🔔 Send Notification</Text>
        <Text>Tap to send a test notification</Text>
        <TouchableOpacity style={styles.button} onPress={sendNotification}>
          <Text style={styles.buttonText}>Send Test Notification</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>MRTC Phone Assistant v1.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  header: {
    backgroundColor: '#1a365d',
    padding: 25,
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'white',
    fontSize: 16,
    marginTop: 5,
  },
  featureCard: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1a365d',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
  },
});