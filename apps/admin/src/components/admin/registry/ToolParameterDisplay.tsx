'use client';

interface JsonSchemaProperty {
  type?: string;
  description?: string;
  enum?: string[];
  items?: JsonSchemaProperty;
  default?: unknown;
}

interface JsonSchema {
  type?: string;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
}

interface ToolParameterDisplayProps {
  parameters: JsonSchema;
}

function formatType(prop: JsonSchemaProperty): string {
  if (prop.enum) return prop.enum.map((v) => `"${v}"`).join(' | ');
  if (prop.type === 'array' && prop.items) return `${prop.items.type || 'any'}[]`;
  return prop.type || 'any';
}

export function ToolParameterDisplay({ parameters }: ToolParameterDisplayProps) {
  const properties = parameters.properties;
  const required = parameters.required || [];

  if (!properties || Object.keys(properties).length === 0) {
    return <p className="text-sm text-gray-500 italic">No parameters</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-left">
          <th className="pb-2 pr-4 font-medium text-gray-500">Name</th>
          <th className="pb-2 pr-4 font-medium text-gray-500">Type</th>
          <th className="pb-2 pr-4 font-medium text-gray-500">Required</th>
          <th className="pb-2 font-medium text-gray-500">Description</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {Object.entries(properties).map(([name, prop]) => (
          <tr key={name} className="text-gray-700">
            <td className="py-2 pr-4 font-mono text-xs">{name}</td>
            <td className="py-2 pr-4 font-mono text-xs text-blue-600">{formatType(prop)}</td>
            <td className="py-2 pr-4">
              {required.includes(name) ? (
                <span className="text-xs font-medium text-amber-600">yes</span>
              ) : (
                <span className="text-xs text-gray-400">no</span>
              )}
            </td>
            <td className="py-2 text-xs text-gray-600">{prop.description || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
