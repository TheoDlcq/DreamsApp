// components/DreamForm.tsx

import { AsyncStorageConfig } from '@/constants/AsyncStorageConfig';
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
        tags: selectedTags
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
    setSelectedTags([]);
    setDate(new Date());
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <TextInput
            label="Titre du rêve"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={[styles.input, { width: width * 0.8, alignSelf: 'center' }]}
          />

          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={[styles.input, { width: width * 0.8, alignSelf: 'center' }]}
          >
            {formatDate(date)}
          </Button>
          
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
            mode="contained"
            onPress={handleDreamSubmission}
            style={styles.button}
          >
            Soumettre
          </Button>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});
