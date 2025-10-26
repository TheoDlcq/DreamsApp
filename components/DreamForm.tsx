// Clean DreamForm component
import { AsyncStorageConfig } from '@/constants/AsyncStorageConfig';
import { DEFAULT_CHARACTERS } from '@/constants/Characters';
import { DEFAULT_TAGS } from '@/constants/Tags';
import { DreamData } from '@/interfaces/DreamData';
import { AsyncStorageService } from '@/services/AsyncStorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { Dimensions, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { Button, Menu, Text, TextInput } from 'react-native-paper';

const { width } = Dimensions.get('window');

export default function DreamForm() {
  const [title, setTitle] = useState('');
  const [dreamText, setDreamText] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState('');

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);

  const [showTagMenu, setShowTagMenu] = useState(false);
  const [showCharacterMenu, setShowCharacterMenu] = useState(false);

  const [emotionBefore, setEmotionBefore] = useState('');
  const [emotionAfter, setEmotionAfter] = useState('');

  const [emotionBeforeIntensity, setEmotionBeforeIntensity] = useState(0);
  const [emotionAfterIntensity, setEmotionAfterIntensity] = useState(0);

  const [clarity, setClarity] = useState(0);
  const [sleepQuality, setSleepQuality] = useState(0);
  const [meaning, setMeaning] = useState('');
  const [tone, setTone] = useState<'positive'|'negative'|'neutral'|''>('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const formatDate = (d: Date) => {
    try { return d.toLocaleDateString(); } catch { return ''; }
  };

  const onDateChange = (_: any, selected?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selected) setDate(selected);
  };

  const handleDreamSubmission = async () => {
    const newDream: DreamData = {
      title: title.trim(),
      dreamText: dreamText.trim(),
      date: formatDate(date),
      location: location.trim(),
      tags: selectedTags,
      characters: selectedCharacters,
      emotionBefore: emotionBefore.trim(),
      emotionAfter: emotionAfter.trim(),
      emotionBeforeIntensity,
      emotionAfterIntensity,
      clarity,
      sleepQuality,
      meaning: meaning.trim(),
      tone: tone || 'neutral',
    };

    try {
      const existing = await AsyncStorageService.getData(AsyncStorageConfig.keys.dreamsArrayKey) || [];
      let next: any[] = [];
      if (editingIndex !== null && typeof editingIndex === 'number' && editingIndex >= 0 && editingIndex < existing.length) {
        next = [...existing];
        next[editingIndex] = newDream;
      } else {
        next = Array.isArray(existing) ? [...existing, newDream] : [newDream];
      }
      await AsyncStorageService.setData(AsyncStorageConfig.keys.dreamsArrayKey, next);

      // clear edit draft if any
      if (editingIndex !== null) {
        await AsyncStorage.removeItem('dreamEdit');
        await AsyncStorage.removeItem('dreamEditIndex');
        setEditingIndex(null);
      }

  // reset
  setTitle(''); setDreamText(''); setDate(new Date()); setLocation('');
  setSelectedTags([]); setSelectedCharacters([]);
  setEmotionBefore(''); setEmotionAfter(''); setEmotionBeforeIntensity(0); setEmotionAfterIntensity(0);
  setClarity(0); setSleepQuality(0); setMeaning(''); setTone('');
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const raw = await AsyncStorage.getItem('dreamEdit');
        const idx = await AsyncStorage.getItem('dreamEditIndex');
        if (raw) {
          const d = JSON.parse(raw);
          setTitle(d.title || '');
          setDreamText(d.dreamText || '');
          setLocation(d.location || '');
          setEmotionBefore(d.emotionBefore || '');
          setEmotionAfter(d.emotionAfter || '');
          setEmotionBeforeIntensity(typeof d.emotionBeforeIntensity === 'number' ? d.emotionBeforeIntensity : 0);
          setEmotionAfterIntensity(typeof d.emotionAfterIntensity === 'number' ? d.emotionAfterIntensity : 0);
          setClarity(typeof d.clarity === 'number' ? d.clarity : 0);
          setSleepQuality(typeof d.sleepQuality === 'number' ? d.sleepQuality : 0);
          setMeaning(d.meaning || '');
          setTone(d.tone || '');
          setSelectedTags(Array.isArray(d.tags) ? d.tags : []);
          setSelectedCharacters(Array.isArray(d.characters) ? d.characters : []);
          if (idx) setEditingIndex(Number(idx));
        }
      } catch (e) { console.error(e); }
    };
    loadDraft();
  }, []);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.container}>
            <View style={styles.card}>
              <TextInput label="Titre du rêve" value={title} onChangeText={setTitle} mode="outlined" style={styles.input} />
              <TextInput label="Résumé du rêve" value={dreamText} onChangeText={setDreamText} mode="outlined" multiline numberOfLines={4} style={styles.input} />

              <View style={styles.row}>
                <Button mode="outlined" onPress={() => setShowDatePicker(true)} style={[styles.input, { flex: 1, marginRight: 8 }]}>{formatDate(date)}</Button>
                <TextInput label="Lieu" value={location} onChangeText={setLocation} mode="outlined" style={[styles.input, { flex: 1 }]} />
              </View>

              {showDatePicker && (<DateTimePicker value={date} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onDateChange} />)}

              <Button mode="outlined" onPress={() => setShowTagMenu(true)} style={styles.input}>{selectedTags.length ? selectedTags.join(', ') : 'Sélectionner des tags'}</Button>
              <Menu visible={showTagMenu} onDismiss={() => setShowTagMenu(false)} anchor={{ x: width * 0.1, y: Platform.OS === 'ios' ? 250 : 200 }}>
                {DEFAULT_TAGS.map((t) => <Menu.Item key={t} onPress={() => setSelectedTags((p) => p.includes(t) ? p.filter(x => x !== t) : [...p, t])} title={t} leadingIcon={selectedTags.includes(t) ? 'check' : undefined} />)}
              </Menu>

              <Button mode="outlined" onPress={() => setShowCharacterMenu(true)} style={styles.input}>{selectedCharacters.length ? selectedCharacters.join(', ') : 'Sélectionner des personnages'}</Button>
              <Menu visible={showCharacterMenu} onDismiss={() => setShowCharacterMenu(false)} anchor={{ x: width * 0.1, y: Platform.OS === 'ios' ? 300 : 250 }}>
                {DEFAULT_CHARACTERS.map((c) => <Menu.Item key={c} onPress={() => setSelectedCharacters((p) => p.includes(c) ? p.filter(x => x !== c) : [...p, c])} title={c} leadingIcon={selectedCharacters.includes(c) ? 'check' : undefined} />)}
              </Menu>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Émotions</Text>

              <View style={styles.stackField}>
                <TextInput label="État émotionnel avant" value={emotionBefore} onChangeText={setEmotionBefore} mode="outlined" style={styles.input} />
                <Text style={styles.ratingLabel}>Intensité avant</Text>
                <View style={styles.ratingRow}>{Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <Button key={`eb-${n}`} mode={emotionBeforeIntensity === n ? 'contained' : 'outlined'} compact onPress={() => setEmotionBeforeIntensity(n)} style={styles.ratingButton}>{n}</Button>
                ))}</View>
              </View>

              <View style={styles.stackField}>
                <TextInput label="État émotionnel après" value={emotionAfter} onChangeText={setEmotionAfter} mode="outlined" style={styles.input} />
                <Text style={styles.ratingLabel}>Intensité après</Text>
                <View style={styles.ratingRow}>{Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <Button key={`ea-${n}`} mode={emotionAfterIntensity === n ? 'contained' : 'outlined'} compact onPress={() => setEmotionAfterIntensity(n)} style={styles.ratingButton}>{n}</Button>
                ))}</View>
              </View>

              <View style={{ marginTop: 8 }}>
                <Text style={styles.ratingLabel}>Clarté du rêve</Text>
                <View style={styles.ratingRow}>{Array.from({ length: 10 }, (_, i) => i + 1).map(n => <Button key={`c-${n}`} mode={clarity === n ? 'contained' : 'outlined'} compact onPress={() => setClarity(n)} style={styles.ratingButton}>{n}</Button>)}</View>

                <Text style={styles.ratingLabel}>Qualité du sommeil</Text>
                <View style={styles.ratingRow}>{Array.from({ length: 10 }, (_, i) => i + 1).map(n => <Button key={`s-${n}`} mode={sleepQuality === n ? 'contained' : 'outlined'} compact onPress={() => setSleepQuality(n)} style={styles.ratingButton}>{n}</Button>)}</View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Signification du rêve</Text>
              <TextInput label="Signification / Interprétation" value={meaning} onChangeText={setMeaning} mode="outlined" multiline numberOfLines={4} style={styles.input} />
              <Text style={styles.ratingLabel}>Tonalité</Text>
              <View style={styles.ratingRow}>
                <Button mode={tone === 'positive' ? 'contained' : 'outlined'} compact onPress={() => setTone('positive')} style={styles.ratingButton}>Positive</Button>
                <Button mode={tone === 'neutral' ? 'contained' : 'outlined'} compact onPress={() => setTone('neutral')} style={styles.ratingButton}>Neutre</Button>
                <Button mode={tone === 'negative' ? 'contained' : 'outlined'} compact onPress={() => setTone('negative')} style={styles.ratingButton}>Négative</Button>
              </View>
            </View>

            <View style={styles.card}>
              <Button mode="contained" onPress={handleDreamSubmission} style={styles.submitButton}>Soumettre</Button>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { paddingVertical: 16 },
  container: { alignItems: 'center', paddingHorizontal: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: width * 0.94, marginBottom: 14 },
  input: { marginBottom: 12, backgroundColor: '#fff' },
  emotionContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  emotionInput: { width: '48%' },
  submitButton: { marginTop: 8 },
  row: { flexDirection: 'row', width: '100%' },
  ratingRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  ratingButton: { marginRight: 6, marginBottom: 6, minWidth: 36, justifyContent: 'center' },
  ratingLabel: { fontSize: 14, marginBottom: 6, color: '#34495e' },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#2c3e50' },
  stackField: { marginBottom: 12 },
});
