// components/DreamList.tsx

import { AsyncStorageConfig } from '@/constants/AsyncStorageConfig';
import { DreamData } from '@/interfaces/DreamData';
import { AsyncStorageService } from '@/services/AsyncStorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Text } from 'react-native-paper';


export default function DreamList() {
    const [dreams, setDreams] = useState<DreamData[]>([]);

    const fetchData = async () => {
        try {
            const formDataArray: DreamData[] = await AsyncStorageService.getData(AsyncStorageConfig.keys.dreamsArrayKey);
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

    return (
        <ScrollView style={styles.scrollView}>
            <Text style={styles.title}>Liste des Rêves</Text>
            {dreams.length > 0 ? (
                dreams.map((dream, index) => (
                    <Card key={index} style={styles.card}>
                        <Card.Title title={dream.title} subtitle={dream.date} />
                        <Card.Content>
                            <Text style={styles.dreamText}>{dream.dreamText}</Text>
                            <Text style={styles.sectionTitle}>Tags :</Text>
                            <View style={styles.tagsContainer}>
                                {dream.tags.map((tag, tagIndex) => (
                                    <Chip key={tagIndex} style={styles.tag} mode="outlined">
                                        {tag}
                                    </Chip>
                                ))}
                            </View>
                            
                            <Text style={styles.sectionTitle}>Personnages :</Text>
                            <View style={styles.tagsContainer}>
                                {dream.characters.map((character, charIndex) => (
                                    <Chip 
                                        key={charIndex} 
                                        style={styles.tag} 
                                        mode="outlined"
                                        icon="account"
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

            <Button
                mode="contained"
                onPress={handleResetDreams}
                style={styles.button}
            >
                Réinitialiser les rêves
            </Button>
        </ScrollView>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    card: {
        marginBottom: 16,
        width: width - 32,
    },
    dreamText: {
        fontSize: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 12,
        marginBottom: 4,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    button: {
        marginVertical: 16,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    tag: {
        margin: 4,
    },
});
