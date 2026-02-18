# WhatsApp Migration Guide: Twilio → Cloud API

**Migrating from Twilio's WhatsApp API to direct Meta Cloud API**

---

## Why Migrate?

**Cost Savings:**
- Twilio: ~$0.010-0.015 per message
- Cloud API: ~$0.005-0.010 per conversation (+ 1,000 free/month)
- **Estimated savings: 30-50%** at scale

**Other Benefits:**
- Direct relationship with Meta
- Access to latest WhatsApp features first
- Better analytics in Meta Business Manager
- No middleman markup

**Trade-offs:**
- More setup complexity
- Need to manage Meta accounts directly
- No Twilio SDK convenience

---

## Migration Strategy

### Phase 1: Setup (No Impact on Existing Users)

1. **Complete Meta setup** (see `whatsapp-cloud-api-setup.md`)
   - Create Meta developer account
   - Generate permanent access token
   - Register phone number

2. **Create and approve templates**
   - Submit all templates to Meta
   - Wait for approval (1min - 48hrs)

3. **Deploy new code** (additive only, no breaking changes)
   - New `WhatsAppCloudClient` exists alongside `WhatsAppMessagingClient`
   - Existing Twilio implementation unchanged
   - Factory supports both providers

### Phase 2: Testing (Internal Only)

1. **Test with internal team:**
   ```sql
   UPDATE users
   SET preferred_messaging_provider = 'whatsapp-cloud'
   WHERE email IN ('team@gymtext.co', 'other@gymtext.co');
   ```

2. **Verify:**
   - Template messages send correctly
   - Webhooks receive inbound messages
   - Status updates work
   - STOP/START commands work

3. **Monitor logs for errors**

### Phase 3: Beta Rollout (10-20% of Users)

1. **Select beta users** (highly engaged, responsive)
   ```sql
   UPDATE users
   SET preferred_messaging_provider = 'whatsapp-cloud'
   WHERE id IN (
     SELECT id FROM users
     WHERE whatsapp_opt_in = TRUE
     ORDER BY created_at DESC
     LIMIT 100
   );
   ```

2. **Monitor for 1 week:**
   - Delivery success rate
   - User engagement
   - Error rates
   - User feedback

3. **Compare metrics:**
   - Cloud API vs Twilio delivery rates
   - Open rates
   - Response rates
   - Cost per message

### Phase 4: Gradual Migration (All Users)

**Week 1:** 25% of users
```sql
UPDATE users
SET preferred_messaging_provider = 'whatsapp-cloud'
WHERE whatsapp_opt_in = TRUE
  AND id IN (
    SELECT id FROM users WHERE whatsapp_opt_in = TRUE
    ORDER BY RANDOM()
    LIMIT (SELECT COUNT(*) / 4 FROM users WHERE whatsapp_opt_in = TRUE)
  );
```

**Week 2:** 50% of users

**Week 3:** 75% of users

**Week 4:** 100% of users

### Phase 5: Deprecate Twilio (Optional)

Once 100% migrated and stable:

1. **Keep Twilio as fallback** (recommended)
   - If Cloud API fails, retry via Twilio
   - Safety net for critical messages

2. **OR fully deprecate:**
   - Remove `WhatsAppMessagingClient` code
   - Remove Twilio WhatsApp-related environment variables
   - Cost savings: eliminate Twilio fees entirely

---

## Side-by-Side Comparison

| Feature | Twilio WhatsApp | Cloud API |
|---------|----------------|-----------|
| **Setup** | Easy (Twilio Console) | Moderate (Meta + Business Manager) |
| **Cost (US)** | ~$0.010/message | ~$0.007/conversation + 1,000 free |
| **Template Management** | Twilio Console | Meta Business Manager |
| **Template Approval** | Via Twilio (Meta) | Direct from Meta |
| **Webhooks** | Twilio signature | Meta verify token |
| **Phone Number** | Twilio's or your own | Your own (required) |
| **API Calls** | Twilio SDK | Direct HTTP (axios) |
| **Free Tier** | None | 1,000 conversations/month |
| **Rate Limits** | Twilio-managed | Meta tier-based (1k-unlimited) |
| **Analytics** | Twilio Console | Meta Business Manager |
| **Fallback** | N/A | Can fallback to Twilio SMS |

---

## Code Comparison

### Sending a Message

**Twilio WhatsApp:**
```typescript
import { whatsappMessagingClient } from '@/server/connections/messaging';

await whatsappMessagingClient.sendMessage(
  user,
  undefined,
  undefined,
  'HXb5b62575e6e4ff6129ad7c8efe1f983e', // Twilio Content SID
  { userName: 'Aaron', date: 'Monday' }
);
```

**Cloud API:**
```typescript
import { getMessagingClientByProvider } from '@/server/connections/messaging';

const client = getMessagingClientByProvider('whatsapp-cloud');

await client.sendMessage(
  user,
  undefined,
  undefined,
  'gymtext_daily_workout_v1', // Meta template name
  { '1': 'Aaron', '2': 'Monday', '3': 'Upper Body' }
);
```

### Template Variables

**Twilio:**
- Use descriptive names: `{ userName, date, workout }`
- Twilio maps to `{{1}}`, `{{2}}`, `{{3}}`

**Cloud API:**
- Use numbered keys: `{ '1', '2', '3' }`
- Directly maps to Meta's `{{1}}`, `{{2}}`, `{{3}}`

### Webhooks

**Twilio:**
- Endpoint: `/api/twilio/sms`
- Validation: Twilio signature
- Format: Form data

**Cloud API:**
- Endpoint: `/api/whatsapp-cloud/webhook`
- Validation: Verify token (GET request)
- Format: JSON

---

## Migration Checklist

### Pre-Migration

- [ ] Meta for Developers account created
- [ ] Meta Business Manager account created
- [ ] System user created with permanent access token
- [ ] Phone number registered with Meta (not Twilio)
- [ ] All templates created and approved
- [ ] Webhooks configured and verified
- [ ] Environment variables set
- [ ] Database migration run
- [ ] Code deployed (no users using it yet)

### Testing

- [ ] Send test message via Cloud API
- [ ] Receive test message (webhook triggered)
- [ ] Template renders correctly
- [ ] Delivery status updates work
- [ ] STOP command works
- [ ] START command works
- [ ] Error handling tested

### Rollout

- [ ] Internal team migrated and tested
- [ ] Beta users (10-20) migrated and monitored
- [ ] Week 1: 25% of users migrated
- [ ] Week 2: 50% of users migrated
- [ ] Week 3: 75% of users migrated
- [ ] Week 4: 100% of users migrated

### Post-Migration

- [ ] Monitor delivery success rates
- [ ] Compare costs (Twilio vs Cloud API)
- [ ] Monitor error logs
- [ ] User feedback collected
- [ ] Decide: keep Twilio as fallback or deprecate

---

## Rollback Plan

If issues arise during migration:

### Quick Rollback (Minutes)

```sql
-- Revert all users to Twilio
UPDATE users
SET preferred_messaging_provider = 'twilio'
WHERE preferred_messaging_provider = 'whatsapp-cloud';
```

### Gradual Rollback (Hours)

```sql
-- Revert beta users only
UPDATE users
SET preferred_messaging_provider = 'twilio'
WHERE preferred_messaging_provider = 'whatsapp-cloud'
  AND id IN (SELECT id FROM beta_users);
```

### Emergency Fallback (Code)

Add automatic fallback in messaging orchestrator:

```typescript
try {
  // Try Cloud API first
  await whatsappCloudClient.sendMessage(user, ...);
} catch (error) {
  console.error('Cloud API failed, falling back to Twilio');
  await twilioWhatsAppClient.sendMessage(user, ...);
}
```

---

## Cost Analysis

### Current: Twilio WhatsApp

**Assumptions:**
- 1,000 active users
- 30 days/month
- 1 message/day per user
- $0.012 per message (Twilio WhatsApp)

**Monthly cost:**
```
1,000 users × 30 messages × $0.012 = $360/month
```

### After: Cloud API

**Assumptions:**
- Same usage
- 50% of users respond (opens 24h free window)
- $0.007 per conversation (US)

**Monthly cost:**
```
Free tier: 1,000 conversations = $0
Paid: (30,000 - 15,000 free windows - 1,000 free) = 14,000 × $0.007 = $98/month
```

**Savings: $262/month (73%)**

### At 10,000 Users

**Twilio:** $3,600/month  
**Cloud API:** ~$1,500/month  
**Savings:** $2,100/month ($25,200/year)

---

## FAQs

### Q: Can I keep using Twilio for SMS and use Cloud API for WhatsApp?

**A:** Yes! The implementation supports both:
- `provider: 'twilio'` for SMS
- `provider: 'whatsapp-cloud'` for WhatsApp
- Users can have different preferences

### Q: What if a template gets rejected?

**A:** Modify and resubmit:
1. Review rejection reason in Meta Business Manager
2. Update template wording
3. Resubmit for approval
4. Usually approved within minutes after fix

### Q: Can I migrate my existing Twilio WhatsApp number to Cloud API?

**A:** Yes, but requires coordination:
1. Deregister number from Twilio WhatsApp
2. Register same number with Meta Cloud API
3. There may be downtime during transition
4. Plan carefully and test with new number first

### Q: What happens if Cloud API goes down?

**A:** Implement fallback:
```typescript
try {
  await cloudAPIClient.sendMessage(user, ...);
} catch (error) {
  await twilioSMSClient.sendMessage(user, ...); // Fallback to SMS
}
```

### Q: Do I need to recreate all templates in Meta?

**A:** Yes, templates in Twilio are separate from Meta:
1. Export template content from Twilio Console
2. Recreate in Meta Business Manager with same wording
3. Submit for approval
4. Map template names in code

---

## Timeline

**Week 1: Setup**
- Day 1-2: Meta account setup
- Day 3-4: Create templates, submit for approval
- Day 5-7: Deploy code, test internally

**Week 2: Beta Testing**
- Day 8-14: Test with 10-20 beta users
- Monitor metrics closely

**Week 3-6: Gradual Rollout**
- Week 3: 25% of users
- Week 4: 50% of users
- Week 5: 75% of users
- Week 6: 100% of users

**Total Migration Time: 6 weeks** (conservative estimate)

---

## Success Metrics

Track these metrics during migration:

1. **Delivery Success Rate**
   - Target: >95% (similar to Twilio)

2. **Message Latency**
   - Target: <5 seconds from send to delivery

3. **Webhook Reliability**
   - Target: >99% of webhooks received

4. **Error Rate**
   - Target: <1% errors

5. **Cost per Message**
   - Target: <$0.008/message (vs $0.012 with Twilio)

6. **User Engagement**
   - Open rate: Should remain similar or improve
   - Response rate: Should remain similar or improve

---

## Support

**Issues during migration?**

1. Check logs for errors
2. Review Meta Business Manager for quality rating
3. Verify templates are approved
4. Test webhooks with ngrok
5. Contact Meta support if needed

**Meta Support:**
- Business Support: https://business.facebook.com/help
- Developer Support: https://developers.facebook.com/support

---

**Happy migrating! 🚀**
