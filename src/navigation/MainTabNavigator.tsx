/**
 * LifeCall - Ana Tab Navigator
 *
 * Swipe destekli 6 ana sekme:
 * - Favoriler
 * - Aramalar
 * - Kişiler
 * - Takvim
 * - Notlar
 * - Ayarlar
 *
 * Ekranlar arasında kaydırarak geçiş yapılabilir
 */

import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  Platform,
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { getPendingTargetTab, LauncherIconType } from '../native/LauncherIconModule';
import PagerView, { PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../theme';

// Ekranlar
import FavoritesScreen from '../screens/FavoritesScreen';
import CallsScreen from '../screens/CallsScreen';
import ContactsScreen from '../screens/ContactsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import NotesScreen from '../screens/NotesScreen';
import SettingsScreen from '../screens/SettingsScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Tab tanımları
interface TabConfig {
  key: string;
  labelKey: string;
  icon: string;
  focusedIcon: string;
  component: React.FC;
}

const TABS: TabConfig[] = [
  {
    key: 'favorites',
    labelKey: 'tabs.favorites',
    icon: 'star-outline',
    focusedIcon: 'star',
    component: FavoritesScreen,
  },
  {
    key: 'calls',
    labelKey: 'tabs.calls',
    icon: 'phone-outline',
    focusedIcon: 'phone',
    component: CallsScreen,
  },
  {
    key: 'contacts',
    labelKey: 'tabs.contacts',
    icon: 'account-group-outline',
    focusedIcon: 'account-group',
    component: ContactsScreen,
  },
  {
    key: 'calendar',
    labelKey: 'tabs.calendar',
    icon: 'calendar-outline',
    focusedIcon: 'calendar',
    component: CalendarScreen,
  },
  {
    key: 'notes',
    labelKey: 'tabs.notes',
    icon: 'note-text-outline',
    focusedIcon: 'note-text',
    component: NotesScreen,
  },
  {
    key: 'settings',
    labelKey: 'tabs.settings',
    icon: 'cog-outline',
    focusedIcon: 'cog',
    component: SettingsScreen,
  },
];

// Tab Bar Item
interface TabBarItemProps {
  tab: TabConfig;
  index: number;
  isActive: boolean;
  onPress: () => void;
  activeColor: string;
  inactiveColor: string;
  label: string;
}

const TabBarItem: React.FC<TabBarItemProps> = ({
  tab,
  index,
  isActive,
  onPress,
  activeColor,
  inactiveColor,
  label,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.tabItemInner, { transform: [{ scale: scaleAnim }] }]}>
        <MaterialCommunityIcons
          name={isActive ? tab.focusedIcon : tab.icon}
          size={24}
          color={isActive ? activeColor : inactiveColor}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: isActive ? activeColor : inactiveColor },
            isActive && styles.tabLabelActive,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {isActive && (
          <View style={[styles.activeIndicator, { backgroundColor: activeColor }]} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Custom Tab Bar
interface CustomTabBarProps {
  currentIndex: number;
  onTabPress: (index: number) => void;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ currentIndex, onTabPress }) => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.divider,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
        },
      ]}
    >
      {TABS.map((tab, index) => (
        <TabBarItem
          key={tab.key}
          tab={tab}
          index={index}
          isActive={currentIndex === index}
          onPress={() => onTabPress(index)}
          activeColor={theme.colors.tabBarActive}
          inactiveColor={theme.colors.tabBarInactive}
          label={t(tab.labelKey) || tab.key}
        />
      ))}
    </View>
  );
};

// Swipe Indicator
interface SwipeIndicatorProps {
  currentIndex: number;
  totalTabs: number;
}

const SwipeIndicator: React.FC<SwipeIndicatorProps> = ({ currentIndex, totalTabs }) => {
  const { theme } = useAppTheme();

  return (
    <View style={styles.swipeIndicatorContainer}>
      {Array.from({ length: totalTabs }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.swipeIndicatorDot,
            {
              backgroundColor:
                index === currentIndex
                  ? theme.colors.primary
                  : theme.colors.onSurfaceVariant + '40',
              width: index === currentIndex ? 16 : 6,
            },
          ]}
        />
      ))}
    </View>
  );
};

// Tab key'den index'e dönüşüm
const getTabIndexByKey = (key: LauncherIconType): number => {
  switch (key) {
    case 'contacts':
      return 2; // Kişiler
    case 'calendar':
      return 3; // Takvim
    case 'notes':
      return 4; // Notlar
    default:
      return 0;
  }
};

// Main Tab Navigator
const MainTabNavigator: React.FC = () => {
  const { theme } = useAppTheme();
  const pagerRef = useRef<PagerView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Launcher kısayolundan başlatıldıysa ilgili sekmeye git
  useEffect(() => {
    const checkLauncherShortcut = async () => {
      try {
        const targetTab = await getPendingTargetTab();
        if (targetTab) {
          const tabIndex = getTabIndexByKey(targetTab);
          // Biraz gecikme ile sekmeye git (UI hazır olsun)
          setTimeout(() => {
            pagerRef.current?.setPage(tabIndex);
            setCurrentIndex(tabIndex);
          }, 100);
        }
      } catch (error) {
        console.warn('Launcher shortcut check failed:', error);
      }
    };

    checkLauncherShortcut();
  }, []);

  const handlePageSelected = useCallback((event: PagerViewOnPageSelectedEvent) => {
    setCurrentIndex(event.nativeEvent.position);
  }, []);

  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
    setCurrentIndex(index);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Swipe Indicator (Üstte) */}
      <SwipeIndicator currentIndex={currentIndex} totalTabs={TABS.length} />

      {/* Pager View - Swipeable Screens */}
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={handlePageSelected}
        overdrag={true}
        overScrollMode="always"
      >
        {TABS.map((tab, index) => (
          <View key={tab.key} style={styles.page}>
            <tab.component />
          </View>
        ))}
      </PagerView>

      {/* Bottom Tab Bar */}
      <CustomTabBar currentIndex={currentIndex} onTabPress={handleTabPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  tabLabelActive: {
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 3,
    borderRadius: 1.5,
  },
  swipeIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  swipeIndicatorDot: {
    height: 4,
    borderRadius: 2,
  },
});

export default MainTabNavigator;
