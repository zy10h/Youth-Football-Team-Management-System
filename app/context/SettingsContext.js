import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { StyleSheet } from "react-native";

const SettingsContext = createContext(null);
const LARGE_TEXT_KEY = "settings.largeText";

const createTextStyles = (isLargeText) =>
  StyleSheet.create({
    body: {
      fontSize: isLargeText ? 18 : 14,
      lineHeight: isLargeText ? 25 : 20,
    },
    small: {
      fontSize: isLargeText ? 16 : 13,
      lineHeight: isLargeText ? 22 : 18,
    },
    title: {
      fontSize: isLargeText ? 30 : 24,
      lineHeight: isLargeText ? 36 : 30,
    },
    cardTitle: {
      fontSize: isLargeText ? 23 : 18,
      lineHeight: isLargeText ? 29 : 24,
    },
    sectionTitle: {
      fontSize: isLargeText ? 24 : 20,
      lineHeight: isLargeText ? 30 : 26,
    },
    input: {
      fontSize: isLargeText ? 18 : 14,
    },
  });

export function SettingsProvider({ children }) {
  const [isLargeText, setIsLargeText] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedLargeText = await AsyncStorage.getItem(LARGE_TEXT_KEY);
        setIsLargeText(savedLargeText ? JSON.parse(savedLargeText) : false);
      } catch (err) {
        console.log("LOAD SETTINGS ERROR:", err.message);
      } finally {
        setSettingsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  const setLargeText = async (value) => {
    setIsLargeText(value);

    try {
      await AsyncStorage.setItem(LARGE_TEXT_KEY, JSON.stringify(value));
    } catch (err) {
      console.log("SAVE SETTINGS ERROR:", err.message);
    }
  };

  const textStyles = useMemo(
    () => createTextStyles(isLargeText),
    [isLargeText]
  );

  const value = useMemo(
    () => ({
      isLargeText,
      setLargeText,
      settingsLoaded,
      textStyles,
    }),
    [isLargeText, settingsLoaded, textStyles]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    return {
      isLargeText: false,
      setLargeText: async () => {},
      settingsLoaded: true,
      textStyles: createTextStyles(false),
    };
  }

  return context;
}
