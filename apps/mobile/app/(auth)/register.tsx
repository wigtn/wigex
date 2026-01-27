import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme';
import { useAuthStore } from '../../lib/stores/authStore';

export default function RegisterScreen() {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    // Validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('입력 오류', '올바른 이메일 형식을 입력해주세요.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('입력 오류', '비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('입력 오류', '비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await register(email.trim(), password, name.trim() || undefined);
      router.replace('/(tabs)');
    } catch {
      // Error is handled in store
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing['2xl'],
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing['2xl'],
    },
    logo: {
      width: 80,
      height: 80,
      borderRadius: borderRadius.xl,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    title: {
      ...typography.headlineLarge,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...typography.bodyMedium,
      color: colors.textSecondary,
    },
    form: {
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    inputContainer: {
      gap: spacing.xs,
    },
    label: {
      ...typography.labelMedium,
      color: colors.text,
    },
    optionalLabel: {
      ...typography.bodySmall,
      color: colors.textTertiary,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
    },
    input: {
      flex: 1,
      ...typography.bodyMedium,
      color: colors.text,
      paddingVertical: spacing.md,
    },
    eyeButton: {
      padding: spacing.xs,
    },
    helperText: {
      ...typography.bodySmall,
      color: colors.textTertiary,
      marginTop: spacing.xs,
    },
    errorText: {
      ...typography.bodySmall,
      color: colors.error,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    registerButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    registerButtonDisabled: {
      opacity: 0.6,
    },
    registerButtonText: {
      ...typography.labelLarge,
      color: colors.textInverse,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing.xl,
      gap: spacing.xs,
    },
    footerText: {
      ...typography.bodyMedium,
      color: colors.textSecondary,
    },
    footerLink: {
      ...typography.labelMedium,
      color: colors.primary,
    },
    backButton: {
      position: 'absolute',
      top: spacing['2xl'],
      left: spacing.lg,
      padding: spacing.sm,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        disabled={isLoading}
      >
        <MaterialIcons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logo}>
            <MaterialIcons name="person-add" size={40} color={colors.primary} />
          </View>
          <Text style={styles.title}>회원가입</Text>
          <Text style={styles.subtitle}>새로운 여행을 시작하세요</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Text style={styles.label}>이름</Text>
              <Text style={styles.optionalLabel}>(선택)</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="이름을 입력하세요"
                placeholderTextColor={colors.textTertiary}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (error) clearError();
                }}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>이메일</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="이메일 주소를 입력하세요"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) clearError();
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>비밀번호</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 입력하세요"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) clearError();
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>8자 이상 입력해주세요</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>비밀번호 확인</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 다시 입력하세요"
                placeholderTextColor={colors.textTertiary}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (error) clearError();
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <MaterialIcons
                  name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[
              styles.registerButton,
              isLoading && styles.registerButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={styles.registerButtonText}>가입하기</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>이미 계정이 있으신가요?</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity disabled={isLoading}>
              <Text style={styles.footerLink}>로그인</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
