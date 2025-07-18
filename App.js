import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Switch,
  Vibration,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

export default function App() {
  const [min, setMin] = useState(null);
  const [max, setMax] = useState(null);
  const [inputComplete, setInputComplete] = useState(false);
  const [number, setNumber] = useState(0);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const [noDuplicate, setNoDuplicate] = useState(false);
  const [durationEnabled, setDurationEnabled] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(2);
  const [sortEnabled, setSortEnabled] = useState(false);
  const [vibrate, setVibrate] = useState(false);

  const [theme, setTheme] = useState('light');

  const [tempMin, setTempMin] = useState('');
  const [tempMax, setTempMax] = useState('');

  const generatedSet = useRef(new Set());
  const fullCycle = useRef([]);

  useEffect(() => {
    if (min !== null && max !== null) {
      fullCycle.current = generateFullCycle(min, max);
      generatedSet.current.clear();
    }
  }, [min, max]);

  function generateFullCycle(start, end) {
    const nums = [];
    for (let i = start; i <= end; i++) nums.push(i);

    const repeatCount = Math.min(3, Math.max(2, Math.floor((end - start + 1) / 3)));
    for (let i = 0; i < repeatCount; i++) {
      const rand = nums[Math.floor(Math.random() * nums.length)];
      nums.push(rand);
    }
    return shuffle(nums);
  }

  function shuffle(array) {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  }

  const generateNumber = () => {
    let rollInterval;
    let durationTime = durationEnabled ? durationSeconds * 1000 : 500;
    let time = 0;

    rollInterval = setInterval(() => {
      const rand = Math.floor(Math.random() * (max - min + 1)) + min;
      setNumber(rand);
      time += 100;
      if (time >= durationTime) {
        clearInterval(rollInterval);

        let final;
        if (noDuplicate) {
          if (fullCycle.current.length === 0) {
            fullCycle.current = generateFullCycle(min, max);
            generatedSet.current.clear();
          }
          final = fullCycle.current.pop();
          while (generatedSet.current.has(final) && fullCycle.current.length > 0) {
            final = fullCycle.current.pop();
          }
          generatedSet.current.add(final);
        } else {
          final = Math.floor(Math.random() * (max - min + 1)) + min;
        }

        if (vibrate) Vibration.vibrate(200);
        setNumber(final);
        setHistory((prev) => {
          const newHist = [...prev, final];
          return sortEnabled ? [...newHist].sort((a, b) => a - b) : newHist;
        });
      }
    }, 100);
  };

  const handleRefresh = () => setNumber(0);

  const handleResetHistory = () => {
    setHistory([]);
    generatedSet.current.clear();
    fullCycle.current = generateFullCycle(min, max);
  };

  const handleInitialSet = () => {
    setInputComplete(true);
    fullCycle.current = generateFullCycle(min, max);
    generatedSet.current.clear();
    setNumber(0);
    setHistory([]);
  };

  const getThemeStyle = () => {
    switch (theme) {
      case 'dark':
        return { backgroundColor: '#222', color: '#fff' };
      case 'medium':
        return { backgroundColor: '#888', color: '#fff' };
      default:
        return { backgroundColor: '#fff', color: '#000' };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getThemeStyle().backgroundColor }]}>
      <TouchableOpacity onPress={() => setSettingsVisible(true)} style={styles.settingsIcon}>
        <Ionicons name="settings" size={40} color="gray" />
      </TouchableOpacity>

      {!inputComplete ? (
        <View style={styles.rangeInputBox}>
          <Text style={{ color: getThemeStyle().color, marginBottom: 10 }}>Enter Range</Text>

          <TextInput
            placeholder="Min"
            placeholderTextColor="#999"
            style={[styles.input, { color: getThemeStyle().color }]}
            keyboardType="numeric"
            value={tempMin}
            onChangeText={setTempMin}
          />

          <TextInput
            placeholder="Max"
            placeholderTextColor="#999"
            style={[styles.input, { color: getThemeStyle().color }]}
            keyboardType="numeric"
            value={tempMax}
            onChangeText={setTempMax}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              const minVal = parseInt(tempMin);
              const maxVal = parseInt(tempMax);
              if (!isNaN(minVal) && !isNaN(maxVal) && minVal < maxVal) {
                setMin(minVal);
                setMax(maxVal);
                handleInitialSet();
              } else {
                alert('Please enter valid numbers (Min < Max)');
              }
            }}>
            <Text style={styles.buttonText}>Set Range</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.generatedBox}>
            <Text style={[styles.largeNumber, { color: getThemeStyle().color }]}>{number}</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={generateNumber}>
            <Text style={styles.buttonText}>Click Here</Text>
          </TouchableOpacity>

          <View style={styles.footerButtons}>
            <TouchableOpacity onPress={handleRefresh}>
              <Text style={styles.refresh}>🔄</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowHistory(!showHistory)}>
              <Text style={styles.refresh}>📜</Text>
            </TouchableOpacity>
          </View>

          {showHistory && (
            <>
              <ScrollView style={styles.historyBox}>
                <Text style={{ color: getThemeStyle().color }}>
                  History: {history.join(', ')}
                </Text>
              </ScrollView>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#d9534f' }]}
                onPress={handleResetHistory}>
                <Text style={styles.buttonText}>Reset History</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}

      <Modal visible={settingsVisible} animationType="slide">
        <ScrollView style={styles.modalBox}>
          <Text style={styles.settingHeader}>⚙️ Settings</Text>

          <View style={styles.settingRow}>
            <Text>No Duplicate</Text>
            <Switch value={noDuplicate} onValueChange={setNoDuplicate} />
          </View>

          <View style={styles.settingRow}>
            <Text>Enable Duration</Text>
            <Switch value={durationEnabled} onValueChange={setDurationEnabled} />
          </View>

          {durationEnabled && (
            <>
              <Text style={{ marginBottom: 10, fontWeight: 'bold', fontSize: 16 }}>
                Rolling Duration: {durationSeconds} second
                {durationSeconds > 1 ? 's' : ''}
              </Text>
              <Slider
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={durationSeconds}
                onValueChange={setDurationSeconds}
              />
            </>
          )}

          <View style={styles.settingRow}>
            <Text>Sort</Text>
            <Switch value={sortEnabled} onValueChange={setSortEnabled} />
          </View>
          <View style={styles.settingRow}>
            <Text>Vibrate</Text>
            <Switch value={vibrate} onValueChange={setVibrate} />
          </View>

          <View style={styles.settingRow}>
            <Text>Dark Theme</Text>
            <Switch value={theme === 'dark'} onValueChange={() => setTheme('dark')} />
          </View>
          <View style={styles.settingRow}>
            <Text>Light Theme</Text>
            <Switch value={theme === 'light'} onValueChange={() => setTheme('light')} />
          </View>
          <View style={styles.settingRow}>
            <Text>Medium Theme</Text>
            <Switch value={theme === 'medium'} onValueChange={() => setTheme('medium')} />
          </View>

          <TouchableOpacity onPress={() => setSettingsVisible(false)} style={styles.button}>
            <Text style={styles.buttonText}>Close Settings</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  generatedBox: {
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeNumber: {
    fontSize: 180,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  settingsIcon: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  refresh: { fontSize: 30, padding: 20 },
  footerButtons: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  historyBox: {
    padding: 10,
    marginTop: 10,
    maxHeight: 100,
  },
  modalBox: { padding: 20, marginTop: 40 },
  settingHeader: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    alignItems: 'center',
  },
  rangeInputBox: {
    alignItems: 'center',
    marginTop: 100,
  },
  input: {
    width: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    textAlign: 'center',
  },
});
