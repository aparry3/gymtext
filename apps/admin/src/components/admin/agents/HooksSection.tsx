'use client';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { RegistryHookMetadata } from './types';

interface HooksConfig {
  preHook?: { hook: string; source?: string } | null;
  postHook?: { hook: string; source?: string } | null;
}

interface HooksSectionProps {
  hooks: RegistryHookMetadata[];
  value: HooksConfig;
  onChange: (config: HooksConfig) => void;
}

const NONE_VALUE = '__none__';

export function HooksSection({ hooks, value, onChange }: HooksSectionProps) {
  const count =
    (value.preHook?.hook ? 1 : 0) + (value.postHook?.hook ? 1 : 0);

  const updateHook = (
    type: 'preHook' | 'postHook',
    hookName: string | null,
    source?: string
  ) => {
    if (!hookName) {
      onChange({ ...value, [type]: null });
    } else {
      onChange({
        ...value,
        [type]: {
          hook: hookName,
          source: source ?? value[type]?.source,
        },
      });
    }
  };

  return (
    <Collapsible>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
        <span>Hooks</span>
        <Badge variant="secondary">{count}</Badge>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pt-2 pb-1 space-y-3">
        {/* Pre-Hook */}
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Pre-Hook</Label>
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={value.preHook?.hook || NONE_VALUE}
              onValueChange={(v) =>
                updateHook('preHook', v === NONE_VALUE ? null : v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>None</SelectItem>
                {hooks.map((h) => (
                  <SelectItem key={h.name} value={h.name}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="source (e.g., args.message)"
              value={value.preHook?.source || ''}
              onChange={(e) =>
                updateHook(
                  'preHook',
                  value.preHook?.hook || null,
                  e.target.value
                )
              }
              disabled={!value.preHook?.hook}
            />
          </div>
        </div>

        {/* Post-Hook */}
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Post-Hook</Label>
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={value.postHook?.hook || NONE_VALUE}
              onValueChange={(v) =>
                updateHook('postHook', v === NONE_VALUE ? null : v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>None</SelectItem>
                {hooks.map((h) => (
                  <SelectItem key={h.name} value={h.name}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="source (e.g., result.overview)"
              value={value.postHook?.source || ''}
              onChange={(e) =>
                updateHook(
                  'postHook',
                  value.postHook?.hook || null,
                  e.target.value
                )
              }
              disabled={!value.postHook?.hook}
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
