// components/DreamList.tsx

import { AsyncStorageConfig } from '@/constants/AsyncStorageConfig';
import { DreamData } from '@/interfaces/DreamData';
import { AsyncStorageService } from '@/services/AsyncStorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Checkbox, Chip, IconButton, Text, TextInput } from 'react-native-paper';


export default function DreamList() {
    const [dreams, setDreams] = useState<DreamData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const fetchData = async () => {
        try {
            const rawArray: any = await AsyncStorageService.getData(AsyncStorageConfig.keys.dreamsArrayKey);

            const formDataArray: DreamData[] = (rawArray || []).map((item: any) => ({
                title: item?.title ?? '',
                dreamText: item?.dreamText ?? item?.text ?? '',
                date: item?.date ?? '',
                location: item?.location ?? item?.city ?? '',
                tags: Array.isArray(item?.tags) ? item.tags : [],
                characters: Array.isArray(item?.characters) ? item.characters : [],
                emotionBefore: item?.emotionBefore ?? '',
                emotionAfter: item?.emotionAfter ?? '',
                emotionBeforeIntensity: typeof item?.emotionBeforeIntensity === 'number' ? item.emotionBeforeIntensity : (item?.emotionBeforeIntensity ? Number(item.emotionBeforeIntensity) : 0),
                emotionAfterIntensity: typeof item?.emotionAfterIntensity === 'number' ? item.emotionAfterIntensity : (item?.emotionAfterIntensity ? Number(item.emotionAfterIntensity) : 0),
                clarity: typeof item?.clarity === 'number' ? item.clarity : (item?.clarity ? Number(item.clarity) : 0),
                sleepQuality: typeof item?.sleepQuality === 'number' ? item.sleepQuality : (item?.sleepQuality ? Number(item.sleepQuality) : 0),
                meaning: item?.meaning ?? '',
                tone: item?.tone ?? '',
            }));

            setDreams(formDataArray);
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
        }
    };

    // Chargement initial
    useEffect(() => {
        fetchData();
    }, []);

    // Rechargement quand on revient sur l’écran
    useFocusEffect(
        useCallback(() => {
            fetchData();
            return () => {
                console.log('This route is now unfocused.');
            };
        }, [])
    );

    const handleResetDreams = async (): Promise<void> => {
        try {
            await AsyncStorage.setItem('dreamFormDataArray', JSON.stringify([]));

            const emptyDreamsData: DreamData[] = [];

            await AsyncStorageService.setData(AsyncStorageConfig.keys.dreamsArrayKey, emptyDreamsData);

            setDreams(emptyDreamsData);

        } catch (error) {
            console.error('Erreur lors de la réinitialisation des données:', error);
        }
    };

    const handleDeleteSingle = async (indexToDelete: number) => {
        try {
            const arr: any = await AsyncStorageService.getData(AsyncStorageConfig.keys.dreamsArrayKey) || [];
            const next = arr.filter((_: any, i: number) => i !== indexToDelete);
            await AsyncStorageService.setData(AsyncStorageConfig.keys.dreamsArrayKey, next);
            setDreams(next);
            setSelectedIndices(prev => prev.filter(i => i !== indexToDelete));
        } catch (e) { console.error(e); }
    };

    const handleDeleteSelected = async () => {
        if (!selectedIndices.length) return;
        try {
            const arr: any = await AsyncStorageService.getData(AsyncStorageConfig.keys.dreamsArrayKey) || [];
            const next = arr.filter((_: any, i: number) => !selectedIndices.includes(i));
            await AsyncStorageService.setData(AsyncStorageConfig.keys.dreamsArrayKey, next);
            setDreams(next);
            setSelectedIndices([]);
        } catch (e) { console.error(e); }
    };

    const router = useRouter();

    const handleEdit = async (indexToEdit: number) => {
        try {
            const arr: any = await AsyncStorageService.getData(AsyncStorageConfig.keys.dreamsArrayKey) || [];
            const dream = arr[indexToEdit];
            if (!dream) return;
            // store draft for DreamForm to pick up
            await AsyncStorage.setItem('dreamEdit', JSON.stringify(dream));
            await AsyncStorage.setItem('dreamEditIndex', String(indexToEdit));
            // navigate to form for editing (first tab)
            router.push('/(tabs)');
        } catch (e) { console.error(e); }
    };

    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.topRow}>
                <Text style={styles.title}>Liste des Rêves</Text>
                <View style={styles.topRightControls}>
                    <TextInput
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        mode="outlined"
                        style={styles.searchInput}
                    />
                    {selectedIndices.length > 0 ? (
                        <Button mode="contained" onPress={async () => {
                            // ask confirmation
                            const confirmed = true; // placeholder — we don't have Alert here, keep simple
                            if (confirmed) await handleDeleteSelected();
                        }}>
                            Supprimer la sélection ({selectedIndices.length})
                        </Button>
                    ) : null}
                </View>
            </View>
            {dreams.length > 0 ? (
                // keep original index for persistence operations
                dreams.map((dream, index) => ({ dream, index }))
                    .filter(({ dream }) => {
                        const q = searchQuery.trim().toLowerCase();
                        if (!q) return true;
                        const inTitle = dream.title?.toLowerCase().includes(q);
                        const inText = dream.dreamText?.toLowerCase().includes(q);
                        const inTags = (dream.tags || []).some(t => t.toLowerCase().includes(q));
                        const inChars = (dream.characters || []).some(c => c.toLowerCase().includes(q));
                        const inMeaning = (dream.meaning || '').toLowerCase().includes(q);
                        return inTitle || inText || inTags || inChars || inMeaning;
                    })
                    .map(({ dream, index }) => (
                    <Card key={index} style={styles.card}>
                        <Card.Title 
                            title={dream.title}
                            subtitle={dream.date + (dream.location ? ' • ' + dream.location : '')}
                            titleStyle={{ fontSize: 20, color: '#2c3e50' }}
                            subtitleStyle={{ color: '#7f8c8d' }}
                            right={() => (
                                <View style={styles.cardRightControls}>
                                    <Checkbox
                                        status={selectedIndices.includes(index) ? 'checked' : 'unchecked'}
                                        onPress={() => {
                                            setSelectedIndices(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
                                        }}
                                    />
                                    <IconButton icon="pencil" size={20} onPress={() => handleEdit(index)} />
                                    <IconButton icon="delete" size={20} onPress={() => handleDeleteSingle(index)} />
                                </View>
                            )}
                        />
                        <Card.Content>
                            <View style={styles.emotionContainer}>
                                <View style={styles.emotionBox}>
                                    <Text style={styles.emotionLabel}>Avant le rêve</Text>
                                    <Text style={styles.emotionText}>{dream.emotionBefore || 'Non spécifié'}</Text>
                                    <Text style={styles.emotionSmall}>Intensité: {dream.emotionBeforeIntensity || '—'}</Text>
                                </View>
                                <View style={styles.emotionBox}>
                                    <Text style={styles.emotionLabel}>Après le rêve</Text>
                                    <Text style={styles.emotionText}>{dream.emotionAfter || 'Non spécifié'}</Text>
                                    <Text style={styles.emotionSmall}>Intensité: {dream.emotionAfterIntensity || '—'}</Text>
                                </View>
                            </View>
                            
                            <Text style={styles.dreamText}>{dream.dreamText}</Text>
                            
                            <View style={styles.ratingsContainer}>
                                <Text style={styles.ratingItem}>Clarté: <Text style={styles.ratingValue}>{dream.clarity || '—'}</Text></Text>
                                <Text style={styles.ratingItem}>Sommeil: <Text style={styles.ratingValue}>{dream.sleepQuality || '—'}</Text></Text>
                            </View>
                            
                            {/* Signification & tonalité */}
                            <Text style={styles.sectionTitle}>Signification</Text>
                            <Text style={styles.dreamText}>{dream.meaning || '—'}</Text>
                            <Text style={styles.sectionTitle}>Tonalité</Text>
                            <Text style={styles.ratingValue}>{dream.tone || '—'}</Text>
                            
                            <Text style={styles.sectionTitle}>Tags</Text>
                            <View style={styles.tagsContainer}>
                                {(dream.tags || []).map((tag, tagIndex) => (
                                    <Chip 
                                        key={tagIndex} 
                                        style={styles.tag} 
                                        mode="outlined"
                                        textStyle={{ color: '#2c3e50' }}
                                    >
                                        {tag}
                                    </Chip>
                                ))}
                            </View>
                            
                            <Text style={styles.sectionTitle}>Personnages</Text>
                            <View style={styles.tagsContainer}>
                                {(dream.characters || []).map((character, charIndex) => (
                                    <Chip 
                                        key={charIndex} 
                                        style={styles.tag} 
                                        mode="outlined"
                                        icon="account"
                                        textStyle={{ color: '#2c3e50' }}
                                    >
                                        {character}
                                    </Chip>
                                ))}
                            </View>
                        </Card.Content>
                    </Card>
                ))
            ) : (
                <Text style={styles.emptyText}>Aucun rêve enregistré</Text>
            )}

            {/* reset moved to third tab */}
        </ScrollView>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
        color: '#2c3e50',
    },
    card: {
        marginBottom: 16,
        width: width - 32,
        borderRadius: 15,
        backgroundColor: '#fff',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    dreamText: {
        fontSize: 16,
        marginBottom: 16,
        lineHeight: 24,
        color: '#2c3e50',
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginTop: 12,
        marginBottom: 8,
        color: '#34495e',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        color: '#7f8c8d',
        fontStyle: 'italic',
    },
    button: {
        marginVertical: 16,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    tag: {
        margin: 4,
    },
    emotionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        padding: 8,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    emotionBox: {
        flex: 1,
        marginHorizontal: 4,
    },
    emotionLabel: {
        fontSize: 12,
        color: '#7f8c8d',
        marginBottom: 4,
    },
    emotionText: {
        fontSize: 14,
        color: '#2c3e50',
    },
    ratingsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    ratingItem: {
        fontSize: 13,
        color: '#2c3e50',
    },
    ratingValue: {
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    emotionSmall: {
        fontSize: 12,
        color: '#7f8c8d',
        marginTop: 6,
    },
    topRow: { marginBottom: 12 },
    topRightControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    searchInput: { flex: 1, marginRight: 8, backgroundColor: '#fff' },
    deleteToggle: { justifyContent: 'center' },
    cardRightControls: { flexDirection: 'row', alignItems: 'center' },
});
