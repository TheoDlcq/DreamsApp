// app/(tabs)/three.tsx

import { Text, View } from '@/components/Themed';
import { AsyncStorageConfig } from '@/constants/AsyncStorageConfig';
import { DEFAULT_CHARACTERS } from '@/constants/Characters';
import { DEFAULT_TAGS } from '@/constants/Tags';
import { AsyncStorageService } from '@/services/AsyncStorageService';
import { useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Button, Chip, TextInput } from 'react-native-paper';

const { width } = Dimensions.get('window');

export default function TabThreeScreen() {
  const [tags, setTags] = useState<string[]>(DEFAULT_TAGS);
  const [characters, setCharacters] = useState<string[]>(DEFAULT_CHARACTERS);
  const [newItem, setNewItem] = useState('');
  const [activeTab, setActiveTab] = useState<'tags' | 'characters'>('tags');

  const addItem = () => {
    if (newItem.trim()) {
      if (activeTab === 'tags' && !tags.includes(newItem.trim())) {
        setTags([...tags, newItem.trim()]);
      } else if (activeTab === 'characters' && !characters.includes(newItem.trim())) {
        setCharacters([...characters, newItem.trim()]);
      }
      setNewItem('');
    }
  };

  const removeItem = (itemToRemove: string) => {
    if (activeTab === 'tags' && !DEFAULT_TAGS.includes(itemToRemove)) {
      setTags(tags.filter(tag => tag !== itemToRemove));
    } else if (activeTab === 'characters' && !DEFAULT_CHARACTERS.includes(itemToRemove)) {
      setCharacters(characters.filter(char => char !== itemToRemove));
    }
  };

  const handleResetDreams = async () => {
    try {
      await AsyncStorageService.setData(AsyncStorageConfig.keys.dreamsArrayKey, []);
    } catch (e) { console.error(e); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gérer les Tags et Personnages</Text>
      
      <View style={styles.tabContainer}>
        <Button
          mode={activeTab === 'tags' ? 'contained' : 'outlined'}
          onPress={() => setActiveTab('tags')}
          style={styles.tabButton}
          icon="tag-multiple"
        >
          Tags
        </Button>
        <Button
          mode={activeTab === 'characters' ? 'contained' : 'outlined'}
          onPress={() => setActiveTab('characters')}
          style={styles.tabButton}
          icon="account-group"
        >
          Personnages
        </Button>
      </View>

      <View style={styles.card}>
        <View style={styles.inputContainer}>
          <TextInput
            label={`Nouveau ${activeTab === 'tags' ? 'tag' : 'personnage'}`}
            value={newItem}
            onChangeText={setNewItem}
            style={styles.input}
            mode="outlined"
          />
          <Button mode="contained" onPress={addItem} icon="plus">
            Ajouter
          </Button>
        </View>

        <View style={styles.itemsContainer}>
          {(activeTab === 'tags' ? tags : characters).map((item) => (
            <Chip
              key={item}
              onClose={
                (activeTab === 'tags' ? DEFAULT_TAGS : DEFAULT_CHARACTERS).includes(item)
                  ? undefined
                  : () => removeItem(item)
              }
              style={styles.chip}
              mode="outlined"
              icon={activeTab === 'characters' ? 'account' : undefined}
            >
              {item}
            </Chip>
          ))}
        </View>
        <View style={{ marginTop: 16 }}>
          <Button mode="contained" onPress={handleResetDreams} icon="trash-can-outline">Réinitialiser les rêves</Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#2c3e50',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    width: width * 0.9,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 5,
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
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 4,
  },
});
