'use client';

import { Input } from '@/components/ui/input';
import { MODEL_OPTIONS, DEFAULT_CONFIG, type ModelId } from './types';

interface ModelConfigPanelProps {
  model: ModelId | null;
  temperature: number | null;
  maxTokens: number | null;
  maxIterations: number | null;
  onChange: (field: string, value: ModelId | number | null) => void;
}

export function ModelConfigPanel({
  model,
  temperature,
  maxTokens,
  maxIterations,
  onChange,
}: ModelConfigPanelProps) {
  const effectiveModel = model ?? DEFAULT_CONFIG.model;
  const effectiveTemperature = temperature ?? DEFAULT_CONFIG.temperature;
  const effectiveMaxTokens = maxTokens ?? DEFAULT_CONFIG.maxTokens;
  const effectiveMaxIterations = maxIterations ?? DEFAULT_CONFIG.maxIterations;

  return (
    <div className="space-y-6 p-4 bg-gray-50 rounded-lg border">
      <h3 className="text-sm font-semibold text-gray-900">Model Configuration</h3>

      {/* Model Selection */}
      <div className="space-y-2">
        <label htmlFor="model" className="block text-sm font-medium text-gray-700">
          Model
        </label>
        <select
          id="model"
          value={effectiveModel}
          onChange={(e) => onChange('model', e.target.value as ModelId)}
          className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
        >
          {MODEL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} - {option.description}
            </option>
          ))}
        </select>
        {model === null && (
          <p className="text-xs text-gray-500">Using default: {DEFAULT_CONFIG.model}</p>
        )}
      </div>

      {/* Temperature */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
            Temperature
          </label>
          <span className="text-sm text-gray-600">{effectiveTemperature.toFixed(1)}</span>
        </div>
        <input
          id="temperature"
          type="range"
          min={0}
          max={2}
          step={0.1}
          value={effectiveTemperature}
          onChange={(e) => onChange('temperature', parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Deterministic (0)</span>
          <span>Creative (2)</span>
        </div>
        {temperature === null && (
          <p className="text-xs text-gray-500">Using default: {DEFAULT_CONFIG.temperature}</p>
        )}
      </div>

      {/* Max Tokens */}
      <div className="space-y-2">
        <label htmlFor="maxTokens" className="block text-sm font-medium text-gray-700">
          Max Tokens
        </label>
        <Input
          id="maxTokens"
          type="number"
          min={1}
          max={200000}
          value={effectiveMaxTokens}
          onChange={(e) => onChange('maxTokens', parseInt(e.target.value, 10) || null)}
        />
        {maxTokens === null && (
          <p className="text-xs text-gray-500">Using default: {DEFAULT_CONFIG.maxTokens}</p>
        )}
      </div>

      {/* Max Iterations (for tool agents) */}
      <div className="space-y-2">
        <label htmlFor="maxIterations" className="block text-sm font-medium text-gray-700">
          Max Iterations (Tool Agents)
        </label>
        <Input
          id="maxIterations"
          type="number"
          min={1}
          max={50}
          value={effectiveMaxIterations}
          onChange={(e) => onChange('maxIterations', parseInt(e.target.value, 10) || null)}
        />
        <p className="text-xs text-gray-500">
          {maxIterations === null
            ? `Using default: ${DEFAULT_CONFIG.maxIterations}`
            : 'Maximum LLM iterations for agents with tools'}
        </p>
      </div>
    </div>
  );
}
