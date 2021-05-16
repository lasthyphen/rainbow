import AsyncStorage from '@react-native-community/async-storage';
import React, { Fragment, useCallback, useMemo } from 'react';
import { Image, Linking, NativeModules, ScrollView, Share } from 'react-native';
import styled from 'styled-components';
import { REVIEW_ANDROID } from '../../config/experimental';
import useExperimentalFlag from '../../config/experimentalHooks';
//import { supportedLanguages } from '../../languages';
import { THEMES, useTheme } from '../../context/ThemeContext';
import AppVersionStamp from '../AppVersionStamp';
import { Icon } from '../icons';
import { Column, ColumnWithDividers } from '../layout';
import {
  ListFooter,
  ListItem,
  ListItemArrowGroup,
  ListItemDivider,
} from '../list';
import { Emoji, Text } from '../text';
import BackupIcon from '@rainbow-me/assets/settingsBackup.png';
import BackupIconDark from '@rainbow-me/assets/settingsBackupDark.png';
import CurrencyIcon from '@rainbow-me/assets/settingsCurrency.png';
import CurrencyIconDark from '@rainbow-me/assets/settingsCurrencyDark.png';
import DarkModeIcon from '@rainbow-me/assets/settingsDarkMode.png';
import DarkModeIconDark from '@rainbow-me/assets/settingsDarkModeDark.png';
import NetworkIcon from '@rainbow-me/assets/settingsNetwork.png';
import NetworkIconDark from '@rainbow-me/assets/settingsNetworkDark.png';
import ShareIcon from '@rainbow-me/assets/SettingsShare.png';
import ShareIconDark from '@rainbow-me/assets/SettingsShareDark.png';
import TwitterIcon from '@rainbow-me/assets/SettingsTwitter.png';
import TwitterIconDark from '@rainbow-me/assets/SettingsTwitterDark.png';
import FeedbackIcon from '@rainbow-me/assets/SettingsFeedback.png';
import FeedbackIconDark from '@rainbow-me/assets/SettingsFeedbackDark.png';
import ReviewIcon from '@rainbow-me/assets/SettingsReview.png';
import ReviewIconDark from '@rainbow-me/assets/SettingsReviewDark.png';
import CodeIcon from '@rainbow-me/assets/SettingsCode.png';
import CodeIconDark from '@rainbow-me/assets/SettingsCodeDark.png';
import networkInfo from '@rainbow-me/helpers/networkInfo';
import WalletTypes from '@rainbow-me/helpers/walletTypes';
import {
  useAccountSettings,
  useDimensions,
  useSendFeedback,
  useWallets,
} from '@rainbow-me/hooks';
import { position } from '@rainbow-me/styles';
import {
  AppleReviewAddress,
  REVIEW_DONE_KEY,
} from '@rainbow-me/utils/reviewAlert';

const { RainbowRequestReview, RNReview } = NativeModules;

export const SettingsExternalURLs = {
  rainbowHomepage: 'https://dijets.io',
  review:
    'itms-apps://itunes.apple.com/us/app/appName/id19088xxr?mt=8&action=write-review',
  twitterDeepLink: 'twitter://user?screen_name=officialdijets',
  twitterWebUrl: 'https://twitter.com/OfficialDijets',
};

const CheckmarkIcon = styled(Icon).attrs({
  name: 'checkmarkCircled',
})`
  box-shadow: 0px 4px 6px
    ${({ theme: { colors, isDarkMode } }) =>
      colors.alpha(isDarkMode ? colors.shadow : colors.blueGreyDark50, 0.4)};
`;

const contentContainerStyle = { flex: 1 };
const Container = styled(ScrollView).attrs({
  contentContainerStyle,
  scrollEventThrottle: 32,
})`
  ${position.cover};
  background-color: ${({ backgroundColor }) => backgroundColor};
`;

// ⚠️ Beware: magic numbers lol
const SettingIcon = styled(Image)`
  ${position.size(60)};
  margin-left: -16;
  margin-right: -11;
  margin-top: 8;
`;

const VersionStampContainer = styled(Column).attrs({
  align: 'center',
  justify: 'end',
})`
  flex: 1;
  padding-bottom: 19;
`;

const WarningIcon = styled(Icon).attrs(({ theme: { colors } }) => ({
  color: colors.orangeLight,
  name: 'warning',
}))`
  box-shadow: 0px 4px 6px
    ${({ theme: { colors, isDarkMode } }) =>
      isDarkMode ? colors.shadow : colors.alpha(colors.orangeLight, 0.4)};
  margin-top: 1;
`;

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const checkAllWallets = wallets => {
  if (!wallets) return false;
  let areBackedUp = true;
  let canBeBackedUp = false;
  let allBackedUp = true;
  Object.keys(wallets).forEach(key => {
    if (!wallets[key].backedUp && wallets[key].type !== WalletTypes.readOnly) {
      allBackedUp = false;
    }

    if (
      !wallets[key].backedUp &&
      wallets[key].type !== WalletTypes.readOnly &&
      !wallets[key].imported
    ) {
      areBackedUp = false;
    }
    if (!wallets[key].type !== WalletTypes.readOnly) {
      canBeBackedUp = true;
    }
  });
  return { allBackedUp, areBackedUp, canBeBackedUp };
};

export default function SettingsSection({
  onCloseModal,
  onPressBackup,
  onPressCurrency,
  onPressDev,
  onPressIcloudBackup,
  /*onPressLanguage,*/
  onPressNetwork,
  onPressShowSecret,
}) {
  const isReviewAvailable = useExperimentalFlag(REVIEW_ANDROID) || ios;
  const { wallets } = useWallets();
  const { /*language,*/ nativeCurrency, network } = useAccountSettings();
  const { isTinyPhone } = useDimensions();

  const { colors, isDarkMode, setTheme, colorScheme } = useTheme();

  const onSendFeedback = useSendFeedback();

  const onPressReview = useCallback(async () => {
    if (ios) {
      onCloseModal();
      RainbowRequestReview.requestReview(handled => {
        if (!handled) {
          AsyncStorage.setItem(REVIEW_DONE_KEY, 'true');
          Linking.openURL(AppleReviewAddress);
        }
      });
    } else {
      RNReview.show();
    }
  }, [onCloseModal]);

  const onPressShare = useCallback(() => {
    Share.share({
      message: `👋️ Swap, Stake, Save and Send Dijets plus many more Dijetal Assets...  ${SettingsExternalURLs.rainbowHomepage}`,
    });
  }, []);

  const onPressTwitter = useCallback(async () => {
    Linking.canOpenURL(SettingsExternalURLs.twitterDeepLink).then(supported =>
      supported
        ? Linking.openURL(SettingsExternalURLs.twitterDeepLink)
        : Linking.openURL(SettingsExternalURLs.twitterWebUrl)
    );
  }, []);

  const { allBackedUp, areBackedUp, canBeBackedUp } = useMemo(
    () => checkAllWallets(wallets),
    [wallets]
  );

  const backupStatusColor = allBackedUp
    ? colors.green
    : colors.alpha(colors.blueGreyDark, 0.5);

  const toggleTheme = useCallback(() => {
    if (colorScheme === THEMES.SYSTEM) {
      setTheme(THEMES.LIGHT);
    } else if (colorScheme === THEMES.LIGHT) {
      setTheme(THEMES.DARK);
    } else {
      setTheme(THEMES.SYSTEM);
    }
  }, [setTheme, colorScheme]);

  return (
    <Container backgroundColor={colors.white} scrollEnabled={isTinyPhone}>
      <ColumnWithDividers dividerRenderer={ListItemDivider} marginTop={7}>
        {canBeBackedUp && (
          <ListItem
            icon={
              <SettingIcon source={isDarkMode ? BackupIconDark : BackupIcon} />
            }
            label="Backup"
            onPress={onPressBackup}
            onPressIcloudBackup={onPressIcloudBackup}
            onPressShowSecret={onPressShowSecret}
            testID="backup-section"
          >
            <ListItemArrowGroup>
              {areBackedUp ? (
                <CheckmarkIcon
                  color={backupStatusColor}
                  isDarkMode={isDarkMode}
                />
              ) : (
                <WarningIcon />
              )}
            </ListItemArrowGroup>
          </ListItem>
        )}
        <ListItem
          icon={
            <SettingIcon
              source={isDarkMode ? CurrencyIconDark : CurrencyIcon}
            />
          }
          label="Currency"
          onPress={onPressCurrency}
          testID="currency-section"
        >
          <ListItemArrowGroup>{nativeCurrency || ''}</ListItemArrowGroup>
        </ListItem>
        <ListItem
          icon={
            <SettingIcon source={isDarkMode ? NetworkIconDark : NetworkIcon} />
          }
          label="Network"
          onPress={onPressNetwork}
          testID="network-section"
        >
          <ListItemArrowGroup>
            {networkInfo?.[network]?.name}
          </ListItemArrowGroup>
        </ListItem>
        <ListItem
          icon={
            <SettingIcon
              source={isDarkMode ? DarkModeIconDark : DarkModeIcon}
            />
          }
          label="Theme"
          onPress={toggleTheme}
          testID={`darkmode-section-${isDarkMode}`}
        >
          <Column align="end" flex="1" justify="end">
            <Text
              color={colors.alpha(colors.blueGreyDark, 0.6)}
              size="large"
              weight="medium"
            >
              {capitalizeFirstLetter(colorScheme)}
            </Text>
          </Column>
        </ListItem>
        {/*<ListItem
        {/*  icon={*/}
        {/*    <SettingIcon source={darkMode ? LanguageIconDark : LanguageIcon} />*/}
        {/*  }*/}
        {/*  label="Language"*/}
        {/*  onPress={onPressLanguage}*/}
        {/*>*/}
        {/*  <ListItemArrowGroup>*/}
        {/*    {supportedLanguages[language] || ''}*/}
        {/*  </ListItemArrowGroup>*/}
        {/*</ListItem>*/}
      </ColumnWithDividers>
      <ListFooter />
      <ColumnWithDividers dividerRenderer={ListItemDivider}>
        <ListItem
          icon={
            <SettingIcon
              source={isDarkMode ? ShareIconDark : ShareIcon}
            />
          }
          label="Share Dijets"
          onPress={onPressShare}
          testID="share-section"
          value={SettingsExternalURLs.rainbowHomepage}
        />
        <ListItem
          icon={
            <SettingIcon
              source={isDarkMode ? TwitterIconDark : TwitterIcon}
            />
          }
          label="Follow Dijets on Twitter"
          onPress={onPressTwitter}
          testID="twitter-section"
          value={SettingsExternalURLs.twitter}
        />
        <ListItem
          icon={
            <SettingIcon
              source={isDarkMode ? FeedbackIconDark : FeedbackIcon}
            />
          }
          label={ios ? 'Feedback and Support' : 'Feedback & Bug Reports'}
          onPress={onSendFeedback}
          testID="feedback-section"
        />
        {isReviewAvailable && (
          <ListItem
          icon={
            <SettingIcon
              source={isDarkMode ? ReviewIconDark : ReviewIcon}
            />
          }
            label="Review Dijets Wallet"
            onPress={onPressReview}
            testID="review-section"
          />
        )}
      </ColumnWithDividers>
      {IS_DEV && (
        <Fragment>
          <ListFooter height={10} />
          <ListItem
            icon={
              <SettingIcon
                source={isDarkMode ? CodeIconDark : CodeIcon}
              />
            }
            label="Developer Settings"
            onPress={onPressDev}
            testID="developer-section"
          />
        </Fragment>
      )}
      <VersionStampContainer>
        <AppVersionStamp />
      </VersionStampContainer>
    </Container>
  );
}
