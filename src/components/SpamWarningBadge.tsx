/**
 * LifeCall - Spam Warning Badge
 *
 * Gelen aramada spam numarası uyarısı gösterir
 */

import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  SpamInfo,
  SPAM_CATEGORY_LABELS,
  SPAM_CATEGORY_ICONS,
  SPAM_CATEGORY_COLORS,
} from '../services/SpamService';

interface SpamWarningBadgeProps {
  spamInfo: SpamInfo;
  style?: object;
  compact?: boolean;
}

const SpamWarningBadge: React.FC<SpamWarningBadgeProps> = ({
  spamInfo,
  style,
  compact = false,
}) => {
  const categoryColor = SPAM_CATEGORY_COLORS[spamInfo.category] || '#F44336';
  const categoryIcon = SPAM_CATEGORY_ICONS[spamInfo.category] || 'alert-octagon';
  const categoryLabel = SPAM_CATEGORY_LABELS[spamInfo.category] || 'Spam';

  // Güven seviyesi etiketi
  const getConfidenceLabel = () => {
    if (spamInfo.confidence >= 80) return 'Yüksek ihtimalle spam';
    if (spamInfo.confidence >= 50) return 'Muhtemelen spam';
    return 'Olası spam';
  };

  // Kaynak etiketi
  const getSourceLabel = () => {
    switch (spamInfo.source) {
      case 'api':
        return 'Topluluk verileri';
      case 'user':
        return 'Sizin bildiriminiz';
      case 'community':
        return 'Topluluk bildirimi';
      default:
        return '';
    }
  };

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: categoryColor }, style]}>
        <MaterialCommunityIcons name={categoryIcon} size={14} color="#FFF" />
        <Text style={styles.compactText}>SPAM</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: categoryColor + '15' }, style]}>
      {/* Üst kısım - İkon ve başlık */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: categoryColor }]}>
          <MaterialCommunityIcons name={categoryIcon} size={24} color="#FFF" />
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: categoryColor }]}>
            ⚠️ {getConfidenceLabel()}
          </Text>
          <Text style={[styles.category, { color: categoryColor }]}>
            {categoryLabel}
          </Text>
        </View>
      </View>

      {/* Detaylar */}
      <View style={styles.details}>
        {/* Bildirim sayısı */}
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="account-group" size={16} color={categoryColor} />
          <Text style={[styles.detailText, { color: categoryColor }]}>
            {spamInfo.reportCount} kişi bildirdi
          </Text>
        </View>

        {/* Spam puanı */}
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="speedometer" size={16} color={categoryColor} />
          <Text style={[styles.detailText, { color: categoryColor }]}>
            Risk skoru: {spamInfo.spamScore}/100
          </Text>
        </View>

        {/* Kaynak */}
        {getSourceLabel() && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="information-outline" size={16} color={categoryColor} />
            <Text style={[styles.detailText, { color: categoryColor }]}>
              {getSourceLabel()}
            </Text>
          </View>
        )}
      </View>

      {/* Açıklama */}
      {spamInfo.description && (
        <View style={[styles.descriptionContainer, { borderTopColor: categoryColor + '30' }]}>
          <Text style={[styles.description, { color: categoryColor }]}>
            "{spamInfo.description}"
          </Text>
        </View>
      )}

      {/* Şirket adı */}
      {spamInfo.companyName && (
        <View style={styles.companyContainer}>
          <MaterialCommunityIcons name="domain" size={14} color={categoryColor} />
          <Text style={[styles.companyName, { color: categoryColor }]}>
            {spamInfo.companyName}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  category: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  details: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    fontWeight: '500',
  },
  descriptionContainer: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  description: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  companyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  companyName: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Compact style
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  compactText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default SpamWarningBadge;
