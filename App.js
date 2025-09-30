import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import * as Contacts from 'expo-contacts';
import * as Location from 'expo-location';
import * as Camera from 'expo-camera';
import * as Notifications from 'expo-notifications';
import * as FileSystem from 'expo-file-system';
import { makePhoneCall } from 'react-native-phone-call';
import { sendSMS } from 'react-native-sms';

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
      
      console.log('Permissions:', {
        contacts: contactsStatus,
        location: locationStatus,
        camera: cameraStatus,
        notifications: notifStatus
      });
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  // Make actual phone call
  const makePhoneCall = () => {
    if (phoneNumber) {
      const args = {
        number: phoneNumber,
        prompt: true, // Show dialer prompt
      };
      
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
          Alert.alert('Success', `Found ${data.length} contacts`);
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
        Alert.alert('Location', 
          `Lat: ${location.coords.latitude}\nLon: ${location.coords.longitude}`);
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
        <TextInput
          style={styles.input}
          placeholder="Phone number"
          value={smsNumber}
          onChangeText={setSmsNumber}
          keyboardType="phone-pad"
        />
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Message"
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
        <TouchableOpacity style={styles.button} onPress={accessContacts}>
          <Text style={styles.buttonText}>Get Contacts</Text>
        </TouchableOpacity>
        <Text>Found: {contacts.length} contacts</Text>
      </View>

      {/* Location */}
      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>📍 Get Location</Text>
        <TouchableOpacity style={styles.button} onPress={getLocation}>
          <Text style={styles.buttonText}>Get Current Location</Text>
        </TouchableOpacity>
        {location && (
          <Text>Lat: {location.coords.latitude}, Lon: {location.coords.longitude}</Text>
        )}
      </View>

      {/* Notifications */}
      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>🔔 Send Notification</Text>
        <TouchableOpacity style={styles.button} onPress={sendNotification}>
          <Text style={styles.buttonText}>Send Test Notification</Text>
        </TouchableOpacity>
      </View>

      {/* Camera */}
      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>📷 Access Camera</Text>
        <TouchableOpacity style={styles.button} onPress={() => Alert.alert('Camera', 'Camera access available')}>
          <Text style={styles.buttonText}>Open Camera</Text>
        </TouchableOpacity>
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
    padding: 20,
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
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  button: {
    backgroundColor: '#1a365d',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});