import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Truck, Hash, Calendar, Settings, Wrench, CheckCircle, MapPin, Search, FileText } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useReports } from '@/hooks/useReports';
import { useTheme } from '@/hooks/use-theme';
import { RefreshCw } from 'lucide-react-native';

export default function FormScreen() {
  const { addReport, isSyncing, syncPendingReports } = useReports();
  const themeColors = useTheme();
  
  // Fields
  const [date] = useState(() => new Date().toLocaleDateString()); // Read only
  const [technician, setTechnician] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [issue, setIssue] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [partsUsed, setPartsUsed] = useState('');
  const [finalStatus, setFinalStatus] = useState('');
  
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    setIsLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setIsLocating(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSave = async () => {
    if (!technician || !vehicle || !issue) {
      Alert.alert('Campos incompletos', 'Por favor llena al menos Técnico, Vehículo y Falla.');
      return;
    }

    setIsSaving(true);
    
    const success = await addReport({
      date,
      technician,
      vehicle,
      plate,
      brand,
      issue,
      actionTaken,
      partsUsed,
      finalStatus,
      location: location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      } : null
    });

    setIsSaving(false);

    if (success) {
      Alert.alert('¡Éxito!', 'Informe guardado localmente (se sincronizará automáticamente).');
      // Reset form
      setTechnician('');
      setVehicle('');
      setPlate('');
      setBrand('');
      setIssue('');
      setActionTaken('');
      setPartsUsed('');
      setFinalStatus('');
    } else {
      Alert.alert('Error', 'Hubo un problema al guardar el reporte.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <ThemedText style={styles.headerCompany}>LOGISTIC FACTORY</ThemedText>
              <ThemedText style={styles.headerTitle}>Informe Técnico</ThemedText>
            </View>
            <TouchableOpacity onPress={syncPendingReports} disabled={isSyncing} style={styles.syncButton}>
              <RefreshCw color="#fff" size={24} />
            </TouchableOpacity>
          </View>
          {isSyncing && (
             <ThemedText style={styles.syncText}>Sincronizando con la nube...</ThemedText>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <ThemedView style={styles.formCard}>
            
            <ThemedText style={styles.label}>Fecha (Automática)</ThemedText>
            <View style={styles.inputContainer}>
              <Calendar color="#0056FF" size={20} style={styles.inputIcon} />
              <TextInput 
                style={[styles.input, { color: themeColors.text }]} 
                value={date}
                editable={false}
              />
            </View>

            <ThemedText style={styles.label}>Técnico</ThemedText>
            <View style={styles.inputContainer}>
              <Settings color="#0056FF" size={20} style={styles.inputIcon} />
              <TextInput 
                style={[styles.input, { color: themeColors.text }]} 
                value={technician}
                onChangeText={setTechnician}
                placeholder="Nombre del técnico"
                placeholderTextColor="#888"
              />
            </View>

            <ThemedText style={styles.label}>Vehículo</ThemedText>
            <View style={styles.inputContainer}>
              <Truck color="#0056FF" size={20} style={styles.inputIcon} />
              <TextInput 
                style={[styles.input, { color: themeColors.text }]} 
                value={vehicle}
                onChangeText={setVehicle}
                placeholder="Nombre o modelo"
                placeholderTextColor="#888"
              />
            </View>

            <View style={styles.row}>
              <View style={styles.flex1}>
                <ThemedText style={styles.label}>Placa</ThemedText>
                <View style={styles.inputContainer}>
                  <Hash color="#0056FF" size={20} style={styles.inputIcon} />
                  <TextInput 
                    style={[styles.input, { color: themeColors.text }]} 
                    value={plate}
                    onChangeText={setPlate}
                    placeholder="Ej. ABC-123"
                    placeholderTextColor="#888"
                  />
                </View>
              </View>
              <View style={styles.spacing} />
              <View style={styles.flex1}>
                <ThemedText style={styles.label}>Marca</ThemedText>
                <View style={styles.inputContainer}>
                  <Search color="#0056FF" size={20} style={styles.inputIcon} />
                  <TextInput 
                    style={[styles.input, { color: themeColors.text }]} 
                    value={brand}
                    onChangeText={setBrand}
                    placeholder="Marca"
                    placeholderTextColor="#888"
                  />
                </View>
              </View>
            </View>

            <ThemedText style={styles.label}>Falla Encontrada</ThemedText>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <FileText color="#0056FF" size={20} style={styles.inputIconTop} />
              <TextInput 
                style={[styles.input, styles.textArea, { color: themeColors.text }]} 
                value={issue}
                onChangeText={setIssue}
                placeholder="Detalle la falla..."
                placeholderTextColor="#888"
                multiline
              />
            </View>

            <ThemedText style={styles.label}>Acción Realizada</ThemedText>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <Wrench color="#0056FF" size={20} style={styles.inputIconTop} />
              <TextInput 
                style={[styles.input, styles.textArea, { color: themeColors.text }]} 
                value={actionTaken}
                onChangeText={setActionTaken}
                placeholder="Trabajo realizado..."
                placeholderTextColor="#888"
                multiline
              />
            </View>

            <ThemedText style={styles.label}>Repuestos Utilizados</ThemedText>
            <View style={styles.inputContainer}>
              <Settings color="#0056FF" size={20} style={styles.inputIcon} />
              <TextInput 
                style={[styles.input, { color: themeColors.text }]} 
                value={partsUsed}
                onChangeText={setPartsUsed}
                placeholder="Ej. Filtro de aceite, Pastillas..."
                placeholderTextColor="#888"
              />
            </View>

            <ThemedText style={styles.label}>Estado Final</ThemedText>
            <View style={styles.inputContainer}>
              <CheckCircle color="#0056FF" size={20} style={styles.inputIcon} />
              <TextInput 
                style={[styles.input, { color: themeColors.text }]} 
                value={finalStatus}
                onChangeText={setFinalStatus}
                placeholder="Operativo / Pendiente..."
                placeholderTextColor="#888"
              />
            </View>

            <ThemedText style={styles.label}>Lugar GPS</ThemedText>
            <ThemedView style={styles.locationContainer}>
              <ThemedView style={styles.locationTextContainer}>
                <MapPin color="#0056FF" size={20} style={styles.inputIcon} />
                {isLocating ? (
                  <ActivityIndicator size="small" color="#0056FF" />
                ) : (
                  <ThemedText style={styles.locationText}>
                    {location 
                      ? `${location.coords.latitude.toFixed(5)}, ${location.coords.longitude.toFixed(5)}` 
                      : 'No disponible'}
                  </ThemedText>
                )}
              </ThemedView>
              <TouchableOpacity style={styles.gpsButton} onPress={getLocation} disabled={isLocating}>
                <ThemedText style={styles.gpsButtonText}>Detectar</ThemedText>
              </TouchableOpacity>
            </ThemedView>

          </ThemedView>

          <TouchableOpacity 
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
            onPress={handleSave} 
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.saveButtonText}>Guardar Informe</ThemedText>
            )}
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: Spacing.four,
    backgroundColor: '#0056FF',
    borderBottomLeftRadius: Spacing.four,
    borderBottomRightRadius: Spacing.four,
    marginBottom: Spacing.two,
    shadowColor: '#0056FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerCompany: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
    opacity: 0.9,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginTop: Spacing.one,
  },
  syncText: {
    color: '#fff',
    fontSize: 12,
    marginTop: Spacing.two,
    fontStyle: 'italic',
  },
  syncButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: Spacing.two,
    borderRadius: Spacing.full,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  formCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    backgroundColor: 'rgba(150, 150, 150, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.15)',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  spacing: {
    width: Spacing.three,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0056FF',
    marginBottom: Spacing.two,
    marginTop: Spacing.two,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 86, 255, 0.3)',
    borderRadius: Spacing.three,
    marginBottom: Spacing.three,
    overflow: 'hidden',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  inputIcon: {
    marginLeft: Spacing.three,
    marginRight: Spacing.two,
  },
  inputIconTop: {
    marginLeft: Spacing.three,
    marginRight: Spacing.two,
    marginTop: Spacing.three,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.three,
    paddingRight: Spacing.three,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: 'transparent',
  },
  locationTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 86, 255, 0.3)',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
  },
  locationText: {
    fontSize: 14,
    flex: 1,
  },
  gpsButton: {
    backgroundColor: '#0056FF',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    justifyContent: 'center',
  },
  gpsButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#0056FF',
    marginTop: Spacing.six,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
    shadowColor: '#0056FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  }
});
