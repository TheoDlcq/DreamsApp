// app/(tabs)/three.tsx

import { Text, View } from '@/components/Themed';
import { DEFAULT_TAGS } from '@/constants/Tags';
import { useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Button, Chip, TextInput } from 'react-native-paper';

const { width } = Dimensions.get('window');

export default function TabThreeScreen() {
  const [tags, setTags] = useState<string[]>(DEFAULT_TAGS);
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (!DEFAULT_TAGS.includes(tagToRemove)) {
      setTags(tags.filter(tag => tag !== tagToRemove));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestion des Tags</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          label="Nouveau tag"
          value={newTag}
          onChangeText={setNewTag}
          style={styles.input}
          mode="outlined"
        />
        <Button mode="contained" onPress={addTag}>
          Ajouter
        </Button>
      </View>

      <View style={styles.tagsContainer}>
        {tags.map((tag) => (
          <Chip
            key={tag}
            onClose={DEFAULT_TAGS.includes(tag) ? undefined : () => removeTag(tag)}
            style={styles.chip}
            mode="outlined"
          >
            {tag}
          </Chip>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.9,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginRight: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: width * 0.9,
  },
  chip: {
    margin: 4,
  },
});
