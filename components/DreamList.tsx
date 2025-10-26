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

    return (
        <ScrollView style={styles.scrollView}>
            <Text style={styles.title}>Liste des Rêves</Text>
            {dreams.length > 0 ? (
                dreams.map((dream, index) => (
                    <Card key={index} style={styles.card}>
                        <Card.Title 
                            title={dream.title}
                            subtitle={dream.date + (dream.location ? ' • ' + dream.location : '')}
                            titleStyle={{ fontSize: 20, color: '#2c3e50' }}
                            subtitleStyle={{ color: '#7f8c8d' }}
                        />
                        <Card.Content>
                            <View style={styles.emotionContainer}>
                                <View style={styles.emotionBox}>
                                    <Text style={styles.emotionLabel}>Avant le rêve</Text>
                                    <Text style={styles.emotionText}>{dream.emotionBefore || 'Non spécifié'}</Text>
                                </View>
                                <View style={styles.emotionBox}>
                                    <Text style={styles.emotionLabel}>Après le rêve</Text>
                                    <Text style={styles.emotionText}>{dream.emotionAfter || 'Non spécifié'}</Text>
                                </View>
                            </View>
                            
                            <Text style={styles.dreamText}>{dream.dreamText}</Text>
                            
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
});
