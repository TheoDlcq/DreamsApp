// components/DreamForm.tsx

import { AsyncStorageConfig } from '@/constants/AsyncStorageConfig';
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
  View,
} from 'react-native';
import { Button, Checkbox, TextInput } from 'react-native-paper';

const { width } = Dimensions.get('window');

export default function DreamForm() {
  const [dreamText, setDreamText] = useState<string>('');
  const [isLucidDream, setIsLucidDream] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [tagInput, setTagInput] = useState<string>('')
  const [tags, setTags] = useState<string[]>([]);

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
        dreamText, 
        isLucidDream, 
        date: formatDate(date)
      });

      await AsyncStorageService.setData(AsyncStorageConfig.keys.dreamsArrayKey, formDataArray);

      console.log(
        'AsyncStorage: ',
        await AsyncStorage.getItem(AsyncStorageConfig.keys.dreamsArrayKey)
      );

    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données:', error);
    }

    setDreamText('');
    setIsLucidDream(false);
    setDate(new Date());
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
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

          <View style={styles.checkboxContainer}>
            <Checkbox.Item
              label="Rêve Lucide"
              status={isLucidDream ? 'checked' : 'unchecked'}
              onPress={() => setIsLucidDream(!isLucidDream)}
            />
          </View>

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
