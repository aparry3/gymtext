'use client';

import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { FormData } from '../index';
import { Home, Building2, User } from 'lucide-react';

interface PreferencesStepProps {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  setValue: UseFormSetValue<FormData>;
  watch: UseFormWatch<FormData>;
}

const trainingLocations = [
  {
    value: 'home' as const,
    label: 'Home Gym',
    description: 'I train at home',
    icon: Home,
  },
  {
    value: 'commercial_gym' as const,
    label: 'Commercial Gym',
    description: 'I have a gym membership',
    icon: Building2,
  },
  {
    value: 'bodyweight' as const,
    label: 'Bodyweight Only',
    description: 'Minimal or no equipment',
    icon: User,
  },
];

const equipmentOptions = [
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'barbell', label: 'Barbell' },
  { value: 'resistance_bands', label: 'Resistance Bands' },
  { value: 'pull_up_bar', label: 'Pull-up Bar' },
  { value: 'cardio_equipment', label: 'Cardio Equipment' },
  { value: 'full_gym', label: 'Full Gym Access' },
];

export function PreferencesStep({ setValue, watch, errors }: PreferencesStepProps) {
  const selectedLocation = watch('trainingLocation');
  const selectedEquipment = watch('equipment') || [];

  const toggleEquipment = (value: string) => {
    const current = selectedEquipment || [];
    if (current.includes(value)) {
      setValue(
        'equipment',
        current.filter((item) => item !== value)
      );
    } else {
      setValue('equipment', [...current, value]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">
          Where will you primarily train?
        </h2>
        <p className="text-muted-foreground">
          We&apos;ll customize your workouts based on your available equipment and space.
        </p>
      </div>

      {/* Training Location */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {trainingLocations.map((location) => {
          const Icon = location.icon;
          const isSelected = selectedLocation === location.value;

          return (
            <button
              key={location.value}
              type="button"
              onClick={() => setValue('trainingLocation', location.value)}
              className={`
                p-4 rounded-xl border-2 transition-all text-center
                ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-border bg-white hover:border-primary/50 hover:shadow-md'
                }
              `}
            >
              <div
                className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                  isSelected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">
                {location.label}
              </h3>
              <p className="text-xs text-muted-foreground">{location.description}</p>
            </button>
          );
        })}
      </div>

      {errors.trainingLocation && (
        <p className="text-sm text-destructive">{errors.trainingLocation.message}</p>
      )}

      {/* Equipment Selection */}
      <div className="pt-4">
        <label className="block text-sm font-medium mb-3 text-foreground">
          What equipment do you have access to?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {equipmentOptions.map((equipment) => {
            const isSelected = selectedEquipment.includes(equipment.value);

            return (
              <button
                key={equipment.value}
                type="button"
                onClick={() => toggleEquipment(equipment.value)}
                className={`
                  p-3 rounded-xl border-2 transition-all text-sm font-medium
                  ${
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-white text-foreground hover:border-primary/50'
                  }
                `}
              >
                {equipment.label}
              </button>
            );
          })}
        </div>
        {errors.equipment && (
          <p className="mt-2 text-sm text-destructive">{errors.equipment.message}</p>
        )}
      </div>
    </div>
  );
}
