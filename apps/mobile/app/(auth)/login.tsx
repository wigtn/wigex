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

export default function LoginScreen() {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const router = useRouter();
  const { login, socialLogin, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch {
      // Error is handled in store
    }
  };

  const handleAppleLogin = async () => {
    // Apple login will be implemented when expo-apple-authentication is properly configured
    Alert.alert('준비 중', 'Apple 로그인은 준비 중입니다.');
  };

  const handleGoogleLogin = async () => {
    // Google login will be implemented when @react-native-google-signin is properly configured
    Alert.alert('준비 중', 'Google 로그인은 준비 중입니다.');
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
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
    },
    inputWrapperFocused: {
      borderColor: colors.primary,
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
    errorText: {
      ...typography.bodySmall,
      color: colors.error,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    loginButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    loginButtonDisabled: {
      opacity: 0.6,
    },
    loginButtonText: {
      ...typography.labelLarge,
      color: colors.textInverse,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.xl,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      paddingHorizontal: spacing.md,
    },
    socialButtons: {
      gap: spacing.md,
    },
    socialButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: spacing.sm,
    },
    socialButtonText: {
      ...typography.labelMedium,
      color: colors.text,
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
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logo}>
            <MaterialIcons name="flight" size={40} color={colors.primary} />
          </View>
          <Text style={styles.title}>Travel Helper</Text>
          <Text style={styles.subtitle}>여행 경비 관리의 시작</Text>
        </View>

        <View style={styles.form}>
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
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={styles.loginButtonText}>로그인</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>또는</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleAppleLogin}
            disabled={isLoading}
          >
            <MaterialIcons name="apple" size={24} color={colors.text} />
            <Text style={styles.socialButtonText}>Apple로 계속하기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            <MaterialIcons name="mail" size={24} color={colors.text} />
            <Text style={styles.socialButtonText}>Google로 계속하기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>계정이 없으신가요?</Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity disabled={isLoading}>
              <Text style={styles.footerLink}>회원가입</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
