// components/DreamForm.tsx

import { AsyncStorageConfig } from '@/constants/AsyncStorageConfig';
import { DEFAULT_CHARACTERS } from '@/constants/Characters';
import { DEFAULT_TAGS } from '@/constants/Tags';
import { DreamData } from '@/interfaces/DreamData';
import { AsyncStorageService } from '@/services/AsyncStorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { Button, Menu, TextInput } from 'react-native-paper';

const { width } = Dimensions.get('window');

export default function DreamForm() {
  const [title, setTitle] = useState<string>('');
  const [dreamText, setDreamText] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagMenu, setShowTagMenu] = useState<boolean>(false);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [showCharacterMenu, setShowCharacterMenu] = useState<boolean>(false);
  const [emotionBefore, setEmotionBefore] = useState<string>('');
  const [emotionAfter, setEmotionAfter] = useState<string>('');
  const [location, setLocation] = useState<string>('');

  const onDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR');
  };

  const handleDreamSubmission = async (): Promise<void> => {
    try {
      const formDataArray: DreamData[] = await AsyncStorageService.getData(AsyncStorageConfig.keys.dreamsArrayKey);

      // Ajouter le nouveau rêve avec la date formatée
      formDataArray.push({ 
        title,
        dreamText, 
        date: formatDate(date),
        location,
        tags: selectedTags,
        characters: selectedCharacters,
        emotionBefore,
        emotionAfter
      });

      await AsyncStorageService.setData(AsyncStorageConfig.keys.dreamsArrayKey, formDataArray);

      console.log(
        'AsyncStorage: ',
        await AsyncStorage.getItem(AsyncStorageConfig.keys.dreamsArrayKey)
      );

    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données:', error);
    }

  setTitle('');
  setDreamText('');
  setLocation('');
  setSelectedTags([]);
  setSelectedCharacters([]);
  setEmotionBefore('');
  setEmotionAfter('');
  setDate(new Date());
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <View style={styles.card}>
            <TextInput
              label="Titre du rêve"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={[styles.input, { width: width * 0.8 }]}
            />

          <View style={styles.row}>
            <Button
              mode="outlined"
              onPress={() => setShowDatePicker(true)}
              style={[styles.input, { flex: 1, marginRight: 8 }]}
            >
              {formatDate(date)}
            </Button>

            <TextInput
              label="Lieu"
              value={location}
              onChangeText={setLocation}
              mode="outlined"
              style={[styles.input, { flex: 1 }]}
            />
          </View>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
            />
          )}
          <TextInput
            label="Rêve"
            value={dreamText}
            onChangeText={setDreamText}
            mode="outlined"
            multiline
            numberOfLines={6}
            style={[styles.input, { width: width * 0.8, alignSelf: 'center' }]}
          />

          <Button 
            mode="outlined"
            onPress={() => setShowTagMenu(true)}
            style={[styles.input, { width: width * 0.8, alignSelf: 'center' }]}
          >
            {selectedTags.length > 0 ? selectedTags.join(', ') : 'Sélectionner des tags'}
          </Button>

          <Menu
            visible={showTagMenu}
            onDismiss={() => setShowTagMenu(false)}
            anchor={{ x: width * 0.1, y: Platform.OS === 'ios' ? 250 : 200 }}
          >
            {DEFAULT_TAGS.map((tag) => (
              <Menu.Item
                key={tag}
                onPress={() => {
                  setSelectedTags((prev) =>
                    prev.includes(tag)
                      ? prev.filter((t) => t !== tag)
                      : [...prev, tag]
                  );
                }}
                title={tag}
                leadingIcon={selectedTags.includes(tag) ? 'check' : undefined}
              />
            ))}
          </Menu>

          <Button 
            mode="outlined"
            onPress={() => setShowCharacterMenu(true)}
            style={[styles.input, { width: width * 0.8, alignSelf: 'center' }]}
          >
            {selectedCharacters.length > 0 ? selectedCharacters.join(', ') : 'Sélectionner des personnages'}
          </Button>

          <Menu
            visible={showCharacterMenu}
            onDismiss={() => setShowCharacterMenu(false)}
            anchor={{ x: width * 0.1, y: Platform.OS === 'ios' ? 300 : 250 }}
          >
            {DEFAULT_CHARACTERS.map((character) => (
              <Menu.Item
                key={character}
                onPress={() => {
                  setSelectedCharacters((prev) =>
                    prev.includes(character)
                      ? prev.filter((c) => c !== character)
                      : [...prev, character]
                  );
                }}
                title={character}
                leadingIcon={selectedCharacters.includes(character) ? 'check' : undefined}
              />
            ))}
          </Menu>

          <Button
            mode="contained"
            onPress={handleDreamSubmission}
            style={styles.submitButton}
          >
            Soumettre
          </Button>
        </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: width * 0.9,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  emotionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  emotionInput: {
    width: '48%',
  },
  submitButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
});
