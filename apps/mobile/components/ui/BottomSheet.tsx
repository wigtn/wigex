// Travel Helper v2.0 - BottomSheet Component

import React, { ReactNode } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showHandle?: boolean;
  height?: 'auto' | 'half' | 'full';
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  showHandle = true,
  height = 'auto',
}: BottomSheetProps) {
  const { colors, borderRadius, spacing, typography, shadows } = useTheme();

  const getHeight = () => {
    switch (height) {
      case 'half':
        return '50%';
      case 'full':
        return '90%';
      default:
        return undefined;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={[
            styles.content,
            {
              backgroundColor: colors.background,
              borderTopLeftRadius: borderRadius.xl,
              borderTopRightRadius: borderRadius.xl,
              maxHeight: '90%',
              height: getHeight(),
            },
          ]}
        >
          {showHandle && (
            <View
              style={[
                styles.handle,
                { backgroundColor: colors.border },
              ]}
            />
          )}

          {title && (
            <View style={[styles.header, { borderBottomColor: colors.divider }]}>
              <Text style={[typography.titleMedium, { color: colors.text }]}>
                {title}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={{ padding: spacing.base }}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    paddingTop: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    flexGrow: 0,
  },
});
