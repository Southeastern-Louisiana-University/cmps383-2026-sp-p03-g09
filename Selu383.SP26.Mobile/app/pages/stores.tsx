import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  Switch,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme, ThemePalette } from '@/app/theme-context';
import MapView, { Marker, UrlTile, PROVIDER_DEFAULT} from 'react-native-maps';



export default function Stores() {
  const { palette, theme, setTheme } = useTheme();
  const isDark = theme === "dark" || theme === "oled";

  const styles = createStyles(palette);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={palette.bg} />

      {/*top bar */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>caffeinated lions</Text>
        <View style={styles.topBarRight}>

          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={12} color={palette.text} opacity={0.8} />
            <Text style={styles.backBtnText}>back</Text>
          </TouchableOpacity>
        </View>
      </View>

    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/*nola location*/}
      <Text style={{
        color: palette.text,
        fontSize: 20,
        letterSpacing: 3,
        textTransform: 'uppercase',
        marginBottom: 12,
        marginTop: 20,
      }}>new orleans location</Text>
      <Text style={{
        color: palette.accent,
        fontSize: 10,
        letterSpacing: 3,
        textTransform: 'uppercase',
        marginBottom: 12,
        marginTop: 10,
      }}>
      1140 S Carrollton Ave, New Orleans, LA, United States</Text>
      <MapView
            style={{ height : 200 }}
            initialRegion={{
                latitude: 29.949352264404297,
                longitude: -90.1276626586914,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }}
            provider={PROVIDER_DEFAULT}
            mapType="none" 
        >
        <UrlTile
          urlTemplate={`https://tiles.stadiamaps.com/tiles/${isDark ? 'alidade_smooth_dark' : 'alidade_smooth'}/{z}/{x}/{y}.png?api_key=178321b1-54c2-4932-af4c-5d60acc9ef13`}
          maximumZ={19}
          flipY={false}
        />
        <Marker
            coordinate={{ latitude: 29.949352264404297, longitude: -90.1276626586914 }}
            title="new orleans location"
        />
        </MapView>

        {/*hammond location*/}
      <Text style={{
        color: palette.text,
        fontSize: 20,
        letterSpacing: 3,
        textTransform: 'uppercase',
        marginBottom: 12,
        marginTop: 26,
      }}>hammond location</Text>
      <Text style={{
        color: palette.accent,
        fontSize: 10,
        letterSpacing: 3,
        textTransform: 'uppercase',
        marginBottom: 12,
        marginTop: 10,
      }}>
      110 North Cate Street, Hammond, LA 70401, United States of America</Text>
      <MapView
            style={{ height : 200 }}
            initialRegion={{
                latitude: 30.5046845,
                longitude: -90.4605094,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }}
            provider={PROVIDER_DEFAULT}
            mapType="none" 
        >
        <UrlTile
          urlTemplate={`https://tiles.stadiamaps.com/tiles/${isDark ? 'alidade_smooth_dark' : 'alidade_smooth'}/{z}/{x}/{y}.png?api_key=178321b1-54c2-4932-af4c-5d60acc9ef13`}
          maximumZ={19}
          flipY={false}
        />
        <Marker
            coordinate={{ latitude: 30.5046845, longitude: -90.4605094 }}
            title="hammond location"
        />
        </MapView>

        {/*new york location*/}
      <Text style={{
        color: palette.text,
        fontSize: 20,
        letterSpacing: 3,
        textTransform: 'uppercase',
        marginBottom: 12,
        marginTop: 26,
      }}>new york location</Text>
      <Text style={{
        color: palette.accent,
        fontSize: 10,
        letterSpacing: 3,
        textTransform: 'uppercase',
        marginBottom: 12,
        marginTop: 10,
      }}>
      72 E 1st St, New York, NY, United States</Text>
      <MapView
            style={{ height : 200 }}
            initialRegion={{
                latitude: 40.72407913208008,
                longitude: -73.9903564453125,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }}
            provider={PROVIDER_DEFAULT}
            mapType="none" 
        >
        <UrlTile
          urlTemplate={`https://tiles.stadiamaps.com/tiles/${isDark ? 'alidade_smooth_dark' : 'alidade_smooth'}/{z}/{x}/{y}.png?api_key=178321b1-54c2-4932-af4c-5d60acc9ef13`}
          maximumZ={19}
          flipY={false}
        />
        <Marker
            coordinate={{ latitude: 40.72407913208008, longitude: -73.9903564453125 }}
            title="new york location"
        />
        </MapView>

        <Text style={styles.footer}>
          new orleans · hammond · new york
        </Text>

      </ScrollView>
    </View>
  );
}

const createStyles = (palette: ThemePalette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.bg },
    topBar: {
      position: "absolute",
      top: 0, left: 0, right: 0,
      zIndex: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 32,
      paddingTop: 52,
      paddingBottom: 12,
      backgroundColor: palette.bg,
      borderBottomWidth: 1,
      borderBottomColor: palette.subtle + "40",
    },
    logo: { color: palette.accent, fontSize: 14, fontWeight: "300", letterSpacing: 1 },
    topBarRight: { flexDirection: "row", alignItems: "center", gap: 8 },
    backBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      borderWidth: 1,
      borderColor: palette.subtle,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    backBtnText: { color: palette.text, fontSize: 11, letterSpacing: 0.5, opacity: 0.8 },
    scroll: { paddingHorizontal: 32, paddingTop: 116, paddingBottom: 64 },
    headline: {
      color: palette.text,
      fontSize: 42,
      fontWeight: "300",
      lineHeight: 50,
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    subline: {
      color: palette.subtle,
      fontSize: 13,
      letterSpacing: 0.5,
      opacity: 0.75,
      marginBottom: 40,
    },
    nameRow: { flexDirection: "row", gap: 12 },
    input: {
      height: 46,
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.subtle + "88",
      borderRadius: 10,
      paddingHorizontal: 14,
      fontSize: 14,
      color: palette.text,
      letterSpacing: 0.3,
    },
    inputError: { borderColor: "#FF5722" },
    eyeBtn: { position: "absolute", right: 14, top: 14 },
    footer: {
      color: palette.subtle,
      fontSize: 11,
      letterSpacing: 1.5,
      textAlign: "center",
      lineHeight: 20,
      marginTop: 24,
      opacity: 0.5,
    },
  });