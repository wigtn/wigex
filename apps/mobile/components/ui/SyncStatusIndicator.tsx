import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSyncStore, SyncStatus } from '../../lib/stores/syncStore';
import { useTheme } from '../../lib/theme';

interface StatusConfig {
  icon: keyof typeof MaterialIcons.glyphMap | null;
  color: string;
  text: string;
}

export function SyncStatusIndicator() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const { status, pendingChanges, sync } = useSyncStore();

  const getStatusConfig = (status: SyncStatus): StatusConfig => {
    switch (status) {
      case 'idle':
        return {
          icon: pendingChanges > 0 ? 'cloud-upload' : 'cloud-done',
          color: pendingChanges > 0 ? colors.warning : colors.success,
          text: pendingChanges > 0 ? `${pendingChanges}개 대기` : '동기화됨',
        };
      case 'syncing':
        return {
          icon: null,
          color: colors.primary,
          text: '동기화 중...',
        };
      case 'error':
        return {
          icon: 'cloud-off',
          color: colors.error,
          text: '동기화 실패',
        };
      case 'offline':
        return {
          icon: 'cloud-off',
          color: colors.textTertiary,
          text: '오프라인',
        };
    }
  };

  const config = getStatusConfig(status);

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.sm,
      gap: spacing.xs,
    },
    text: {
      ...typography.bodySmall,
      color: config.color,
    },
  });

  return (
    <TouchableOpacity
      onPress={sync}
      disabled={status === 'syncing' || status === 'offline'}
      activeOpacity={0.7}
    >
      <View style={styles.container}>
        {status === 'syncing' ? (
          <ActivityIndicator size="small" color={config.color} />
        ) : config.icon ? (
          <MaterialIcons name={config.icon} size={16} color={config.color} />
        ) : null}
        <Text style={styles.text}>{config.text}</Text>
      </View>
    </TouchableOpacity>
  );
}
