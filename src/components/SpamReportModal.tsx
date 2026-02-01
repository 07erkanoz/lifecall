/**
 * LifeCall - Spam Report Modal
 *
 * Kullanıcıların spam numaralarını bildirmesi için modal
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import {
  Portal,
  Modal,
  Text,
  Button,
  RadioButton,
  ActivityIndicator,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../theme';
import {
  spamService,
  SpamCategory,
  SPAM_CATEGORY_LABELS,
  SPAM_CATEGORY_ICONS,
  SPAM_CATEGORY_COLORS,
} from '../services/SpamService';

interface SpamReportModalProps {
  visible: boolean;
  phoneNumber: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const SPAM_CATEGORIES: SpamCategory[] = [
  'telemarketing',
  'scam',
  'robocall',
  'fraud',
  'harassment',
  'survey',
  'debt_collector',
  'political',
  'unknown',
];

const SpamReportModal: React.FC<SpamReportModalProps> = ({
  visible,
  phoneNumber,
  onClose,
  onSuccess,
}) => {
  const { theme } = useAppTheme();
  const [selectedCategory, setSelectedCategory] = useState<SpamCategory>('unknown');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const success = await spamService.reportSpam(
        phoneNumber,
        selectedCategory,
        description.trim() || undefined
      );

      if (success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setSelectedCategory('unknown');
          setDescription('');
          onSuccess?.();
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Spam bildirimi başarısız:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedCategory('unknown');
    setDescription('');
    setSubmitted(false);
    onClose();
  };

  if (submitted) {
    return (
      <Portal>
        <Modal
          visible={visible}
          onDismiss={handleClose}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={styles.successContainer}>
            <View style={[styles.successIcon, { backgroundColor: '#4CAF50' + '20' }]}>
              <MaterialCommunityIcons name="check" size={48} color="#4CAF50" />
            </View>
            <Text style={[styles.successTitle, { color: theme.colors.onSurface }]}>
              Teşekkürler!
            </Text>
            <Text style={[styles.successText, { color: theme.colors.onSurfaceVariant }]}>
              Bildiriminiz başarıyla kaydedildi.
            </Text>
          </View>
        </Modal>
      </Portal>
    );
  }

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleClose}
        contentContainerStyle={[
          styles.modal,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.headerIcon, { backgroundColor: '#F44336' + '20' }]}>
              <MaterialCommunityIcons name="alert-octagon" size={28} color="#F44336" />
            </View>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>
              Spam Bildir
            </Text>
            <Text style={[styles.phoneNumber, { color: theme.colors.onSurfaceVariant }]}>
              {phoneNumber}
            </Text>
          </View>

          {/* Kategori Seçimi */}
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Spam Türü
          </Text>

          <RadioButton.Group
            value={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value as SpamCategory)}
          >
            {SPAM_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryItem,
                  { backgroundColor: theme.colors.surfaceVariant },
                  selectedCategory === category && {
                    borderColor: SPAM_CATEGORY_COLORS[category],
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <View style={styles.categoryLeft}>
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: SPAM_CATEGORY_COLORS[category] + '20' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={SPAM_CATEGORY_ICONS[category]}
                      size={20}
                      color={SPAM_CATEGORY_COLORS[category]}
                    />
                  </View>
                  <Text style={[styles.categoryLabel, { color: theme.colors.onSurface }]}>
                    {SPAM_CATEGORY_LABELS[category]}
                  </Text>
                </View>
                <RadioButton
                  value={category}
                  color={SPAM_CATEGORY_COLORS[category]}
                />
              </TouchableOpacity>
            ))}
          </RadioButton.Group>

          {/* Açıklama */}
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Açıklama (Opsiyonel)
          </Text>

          <TextInput
            style={[
              styles.descriptionInput,
              {
                backgroundColor: theme.colors.surfaceVariant,
                color: theme.colors.onSurface,
                borderColor: theme.colors.outline,
              },
            ]}
            placeholder="Ek bilgi ekleyebilirsiniz..."
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={500}
          />

          {/* Butonlar */}
          <View style={styles.buttons}>
            <Button
              mode="outlined"
              onPress={handleClose}
              style={styles.cancelButton}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={[styles.submitButton, { backgroundColor: '#F44336' }]}
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Spam Olarak Bildir
            </Button>
          </View>

          {/* Bilgi notu */}
          <View style={[styles.infoNote, { backgroundColor: theme.colors.surfaceVariant }]}>
            <MaterialCommunityIcons
              name="information-outline"
              size={18}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
              Bildiriminiz toplulukla paylaşılarak diğer kullanıcıların korunmasına yardımcı olur.
            </Text>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    borderRadius: 16,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  descriptionInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  successContainer: {
    alignItems: 'center',
    padding: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  successText: {
    fontSize: 15,
    textAlign: 'center',
  },
});

export default SpamReportModal;
