// src/features/buyer/chat/components/ChatRequestModal.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ChatRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onSend: (message: string, bookingDate?: string) => Promise<void>;
  mobileTitle?: string;
  entityType?: string;
}

const ChatRequestModal: React.FC<ChatRequestModalProps> = ({
  visible,
  onClose,
  onSend,
  mobileTitle = 'this mobile',
  entityType = 'mobile',
}) => {
  const getDefaultMessage = () => {
    switch (entityType) {
      case 'laptop':
        return 'Hi, is this laptop available?';
      case 'car':
        return 'Hi, is this car available?';
      case 'bike':
        return 'Hi, is this bike available?';
      case 'mobile':
      default:
        return 'Hi, is this phone available?';
    }
  };

  const [message, setMessage] = useState(getDefaultMessage());
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      return;
    }

    try {
      setLoading(true);
      // Auto-send today's date for laptop bookings (local timezone)
      let todayDate: string | undefined;
      if (entityType === 'laptop') {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        todayDate = `${year}-${month}-${day}`;
      }
      await onSend(message.trim(), todayDate);
      setMessage(getDefaultMessage()); // Reset
      onClose();
    } catch (error) {
      console.error('Failed to send request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setMessage(getDefaultMessage()); // Reset
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
          disabled={loading}
        />

        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Icon name="message-text" size={24} color="#0F5E87" />
              </View>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
                disabled={loading}
              >
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <Text style={styles.title}>Send request to seller</Text>
            <Text style={styles.subtitle}>
              Your message will be sent to the seller for{' '}
              <Text style={styles.mobileName}>{mobileTitle}</Text>
            </Text>

            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={message}
                onChangeText={setMessage}
                placeholder="Type your message..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                maxLength={500}
                editable={!loading}
                autoFocus
              />
              <Text style={styles.charCount}>{message.length}/500</Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!message.trim() || loading) && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!message.trim() || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="send" size={18} color="#FFFFFF" />
                    <Text style={styles.sendButtonText}>Send Request</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5F3F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  mobileName: {
    fontWeight: '600',
    color: '#0F5E87',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#0F172A',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 6,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  sendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#0F5E87',
    gap: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ChatRequestModal;
