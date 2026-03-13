/**
 * WhatsApp Template Sender
 *
 * High-level helper for sending WhatsApp template messages via the Cloud API.
 * Handles component assembly for templates with headers, body variables, and URL buttons.
 */

import axios from 'axios';
import type { WhatsAppTemplateDefinition } from './templates';
import { TEMPLATE_BY_NAME, TEMPLATE_VARIABLES } from './templates';
import { hasOpenWindow } from './messagingWindow';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SendTemplateConfig {
  phoneNumberId: string;
  accessToken: string;
  apiVersion: string;
}

interface TemplateMessageResult {
  messageId: string;
  waId: string;
  usedFreeWindow: boolean;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Send a template message to a user.
 *
 * Automatically assembles the correct component structure based on the template definition,
 * including body parameters, header parameters, and button URL parameters.
 *
 * @param to - Recipient phone in E.164 (no +), e.g. "15551234567"
 * @param templateName - Registered template name (e.g. "daily_workout_ready_v1")
 * @param variables - Object with named variables matching TEMPLATE_VARIABLES keys
 * @param config - API credentials
 */
export async function sendTemplate(
  to: string,
  templateName: string,
  variables: Record<string, string>,
  config: SendTemplateConfig
): Promise<TemplateMessageResult> {
  const template = TEMPLATE_BY_NAME[templateName];
  if (!template) {
    throw new Error(`Unknown template: ${templateName}`);
  }

  const variableOrder = TEMPLATE_VARIABLES[templateName];
  if (!variableOrder) {
    throw new Error(`No variable mapping for template: ${templateName}`);
  }

  // Build ordered body parameter values
  const bodyParams = variableOrder.map((key) => {
    const val = variables[key];
    if (val === undefined) {
      throw new Error(`Missing variable "${key}" for template "${templateName}"`);
    }
    return val;
  });

  // Build the components array for the send payload
  const components = buildSendComponents(template, bodyParams, variables);

  const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: template.language },
      components,
    },
  };

  console.log(`[TemplateSender] Sending "${templateName}" to ${to} with ${bodyParams.length} variables`);

  const response = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const data = response.data;

  return {
    messageId: data.messages?.[0]?.id ?? '',
    waId: data.contacts?.[0]?.wa_id ?? to,
    usedFreeWindow: false, // Template messages are never free (always billed)
  };
}

/**
 * Send a free-form text message (only works within 24-hour window).
 *
 * Falls back to template if no window is open for the user.
 * Returns null if the window is closed (caller should use sendTemplate instead).
 */
export async function sendFreeFormIfWindowOpen(
  userId: string,
  to: string,
  text: string,
  config: SendTemplateConfig
): Promise<{ messageId: string } | null> {
  if (!hasOpenWindow(userId)) {
    console.log(`[TemplateSender] No open window for user ${userId}, skipping free-form`);
    return null;
  }

  const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: {
      preview_url: false,
      body: text,
    },
  };

  console.log(`[TemplateSender] Sending free-form to ${to} (within 24h window)`);

  const response = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  return {
    messageId: response.data.messages?.[0]?.id ?? '',
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Build the components array for a template send request.
 *
 * The Meta API requires separate component entries for:
 *   - HEADER parameters (if header has variables)
 *   - BODY parameters
 *   - BUTTON parameters (for URL buttons with dynamic suffixes)
 */
function buildSendComponents(
  template: WhatsAppTemplateDefinition,
  bodyParams: string[],
  variables: Record<string, string>
): Array<Record<string, unknown>> {
  const components: Array<Record<string, unknown>> = [];

  // Body parameters
  if (bodyParams.length > 0) {
    components.push({
      type: 'body',
      parameters: bodyParams.map((v) => ({ type: 'text', text: v })),
    });
  }

  // Button URL parameters
  // URL buttons with {{1}}, {{2}} in the URL need parameters
  const buttonsComponent = template.components.find((c) => c.type === 'BUTTONS');
  if (buttonsComponent?.buttons) {
    buttonsComponent.buttons.forEach((btn, idx) => {
      if (btn.type === 'URL' && btn.url?.includes('{{')) {
        // Extract the dynamic portion — for simplicity, use the 'date' variable
        // which is the most common dynamic URL param
        const dateValue = variables['date'] || variables['currentDate'] || '';
        if (dateValue) {
          components.push({
            type: 'button',
            sub_type: 'url',
            index: idx.toString(),
            parameters: [{ type: 'text', text: dateValue }],
          });
        }
      }
    });
  }

  return components;
}
